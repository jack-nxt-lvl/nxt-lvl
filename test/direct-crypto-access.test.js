const test=require('node:test');
const assert=require('node:assert/strict');
const access=require('../lib/crypto-checkout-access');
const quote=require('../api/create-direct-payment-quote');
const {verifyQuote}=require('../lib/direct-payment');
process.env.CRYPTO_QUOTE_SECRET='test-only-signing-secret-at-least-32-characters';
process.env.UPSTASH_REDIS_REST_URL='https://redis.example.test';
process.env.UPSTASH_REDIS_REST_TOKEN='test-only';
const customer={name:'Test Purchaser',email:'test@example.invalid',phone:'5555550100',address:'100 Test Street',city:'Miami',state:'FL',zip:'33137'};
const consent={attestation:true,policyVersion:access.POLICY_VERSION};
const req=(extra={})=>({method:'POST',headers:{origin:'https://www.nxtlvl-research.com','x-forwarded-for':'203.0.113.42'},body:{asset:'BTC',items:[{key:'bac-water-10ml::0',qty:1}],fulfillment:'shipping',customer,researchConsent:consent,...extra}});
function res(){return {headers:{},status(n){this.code=n;return this;},setHeader(k,v){this.headers[k]=v;return this;},end(s){this.body=s?JSON.parse(s):null;return this;}};}
async function mockNetwork(fn,{count=1}={}){
 const old=global.fetch;const calls=[];
 global.fetch=async(url,options)=>{
  calls.push(url);
  if(url==='https://redis.example.test'){
   const args=JSON.parse(options.body);const result=args[0]==='PING'?'PONG':args[0]==='INCR'?count:args[0]==='SET'?'OK':1;
   return {ok:true,json:async()=>({result})};
  }
  if(String(url).includes('coinbase'))return {ok:true,json:async()=>({data:{amount:'100000',rates:{USD:'100000'}}})};
  if(String(url).includes('coingecko'))return {ok:true,json:async()=>({bitcoin:{usd:100000},ethereum:{usd:3000},tether:{usd:1}})};
  throw new Error('Unexpected external request: '+url);
 };
 try{return await fn(calls);}finally{global.fetch=old;}
}
test('direct crypto has its own explicit switch and does not enable card approval',async()=>{
 delete process.env.DIRECT_CRYPTO_CHECKOUT_ENABLED;
 const old=global.fetch;global.fetch=()=>{throw new Error('Unexpected network');};
 try{await assert.rejects(()=>access.authorize(req(),customer),e=>e.httpStatus===403);assert.equal(await access.ready(),false);}finally{global.fetch=old;}
 assert.notEqual(process.env.STRIPE_RESEARCH_APPROVED,'true');
});
test('missing acknowledgment, false acknowledgment and stale terms fail before external calls',async()=>{
 process.env.DIRECT_CRYPTO_CHECKOUT_ENABLED='true';const old=global.fetch;global.fetch=()=>{throw new Error('Unexpected network');};
 try{for(const researchConsent of [undefined,{}, {...consent,attestation:false},{...consent,policyVersion:'2026-10-17'},{...consent,policyVersion:'old'}])await assert.rejects(()=>access.authorize(req({researchConsent}),customer),/accept/);}finally{global.fetch=old;}
});
test('non-US region and invalid ZIP cannot produce payment instructions',async()=>{
 process.env.DIRECT_CRYPTO_CHECKOUT_ENABLED='true';
 for(const changed of [{state:'ON',zip:'M5V 1A1'},{state:'FL',zip:'331'},{state:'FL',zip:'33137<script>'}])await assert.rejects(()=>access.authorize(req(),{...customer,...changed}),/U.S./);
});
test('valid consent permits direct checkout without an approval code and rate limits abuse',async()=>{
 process.env.DIRECT_CRYPTO_CHECKOUT_ENABLED='true';
 await mockNetwork(async calls=>{const result=await access.authorize(req(),customer);assert.equal(result.policyVersion,access.POLICY_VERSION);assert.equal(result.reference,undefined);assert.ok(result.acknowledgedAt);assert.equal(calls.length,2);});
 await mockNetwork(async()=>assert.rejects(()=>access.authorize(req(),customer),e=>e.httpStatus===429),{count:31});
});
test('database failure cannot bypass rate limiting',async()=>{
 const old=global.fetch;global.fetch=async()=>{throw new Error('offline');};
 try{await assert.rejects(()=>access.authorize(req(),customer),/unavailable/);}finally{global.fetch=old;}
});
test('restored quote uses current shipping, signed buyer/cart and real network requirements without emails',async()=>{
 process.env.DIRECT_CRYPTO_CHECKOUT_ENABLED='true';
 await mockNetwork(async calls=>{
  const output=res();await quote(req(),output);
  assert.equal(output.code,200,output.body.error);
  assert.equal(output.body.totalUsd,'26.00');
  assert.equal(output.body.network,'Bitcoin Mainnet');
  assert.equal(output.body.confirmationsRequired,6);
  assert.match(output.body.qrDataUrl,/^data:image\/png;base64,/);
  const signed=verifyQuote(output.body.quoteToken);
  assert.equal(signed.researchPolicyVersion,access.POLICY_VERSION);
  assert.equal(signed.researchApprovalId,undefined);
  assert.ok(signed.customerDigest&&signed.itemDigest);
  assert.ok(signed.fulfillmentPricingVersion);
  assert.equal(calls.some(x=>String(x).includes('resend')||String(x).includes('stripe')),false);
 });
});

test('readiness verifies the live ledger instead of trusting configured variables',async()=>{
 process.env.DIRECT_CRYPTO_CHECKOUT_ENABLED='true';
 await mockNetwork(async()=>assert.equal(await access.ready(),true));
 const old=global.fetch;global.fetch=async()=>{throw new Error('offline');};
 try{assert.equal(await access.ready(),false);}finally{global.fetch=old;}
});
