const test=require('node:test');
const assert=require('node:assert/strict');
const {normalizeOrder,cleanCustomer,customerDigest}=require('../lib/direct-payment');
const access=require('../lib/research-access');
const apply=require('../api/research-application');
const quote=require('../api/create-direct-payment-quote');
const card=require('../api/create-card-payment-link');
const {cardLinkCapabilities}=require('../lib/hosted-card-link');
process.env.UPSTASH_REDIS_REST_URL='https://redis.example.test';
process.env.UPSTASH_REDIS_REST_TOKEN='test-only';
const customer=cleanCustomer({name:'Example Lab Buyer',email:'buyer@lab.example',phone:'5555550100',address:'100 Lab Street',city:'Miami',state:'FL',zip:'33101'},'shipping');
const items=[{key:'bpc157-10::0',qty:1}];
const order=normalizeOrder(items,'shipping');
const reference='RR-'+'b'.repeat(32);
const code='a'.repeat(64);
function approved(){return {reference,status:'approved',policyVersion:access.POLICY_VERSION,expiresAt:Date.now()+60000,customerDigest:customerDigest(customer),itemDigest:order.itemDigest,totalCents:order.totalCents,fulfillment:order.mode,orderId:'NXT-REVIEW-TEST-123'};}
function res(){return {headers:{},status(n){this.code=n;return this;},setHeader(k,v){this.headers[k]=v;return this;},end(s){this.body=s?JSON.parse(s):null;return this;}};}
function request(extra={}){return {method:'POST',headers:{origin:'https://www.nxtlvl-research.com','x-forwarded-for':'203.0.113.1'},body:{items,customer,fulfillment:'shipping',research:{organization:'Example Research Lab',role:'Research purchaser',website:'https://lab.example',purpose:'Analytical identity comparison in an institutional laboratory.',attestation:true,policyVersion:access.POLICY_VERSION},...extra}};}
async function withRedis(run,record=approved()){
 const old=global.fetch;const values=new Map([[access.PREFIX+'code:'+access.hash(code),reference],[access.key(reference),JSON.stringify(record)]]);const emails=[];
 global.fetch=async(url,options)=>{
  if(url==='https://api.resend.com/emails'){emails.push(JSON.parse(options.body));return {ok:true,json:async()=>({id:'test'})};}
  assert.equal(url,process.env.UPSTASH_REDIS_REST_URL,'No payment network or applicant website may be called');
  const [cmd,k,v,...rest]=JSON.parse(options.body);let result;
  if(cmd==='GET')result=values.get(k)||null;
  else if(cmd==='SET'){if(rest.includes('NX')&&values.has(k))result=null;else {values.set(k,v);result='OK';}}
  else if(cmd==='INCR'){result=Number(values.get(k)||0)+1;values.set(k,result);}
  else if(cmd==='EXPIRE')result=1;
  else throw new Error('Unexpected redis command: '+cmd);
  return {ok:true,json:async()=>({result})};
 };
 try{await run({values,emails});}finally{global.fetch=old;}
}
test('new anonymous crypto requests fail closed before any network activity',async()=>{
 delete process.env.RESEARCH_COMMERCE_ENABLED;const old=global.fetch;global.fetch=()=>{throw new Error('Unexpected network')};
 try{const output=res();await quote(request({asset:'BTC'}),output);assert.equal(output.code,403);assert.equal(output.body.quoteToken,undefined);}finally{global.fetch=old;}
});
test('Stripe keys alone do not enable card processing',()=>{
 process.env.STRIPE_SECRET_KEY='sk_test_1234567890abcdefghijklmnop';process.env.STRIPE_WEBHOOK_SECRET='whsec_1234567890abcdefghijklmnop';process.env.RESEND_API_KEY='test';
 process.env.RESEARCH_COMMERCE_ENABLED='true';delete process.env.STRIPE_RESEARCH_APPROVED;
 assert.equal(cardLinkCapabilities().available,false);
});
test('an attestation or forged approval cannot authorize crypto or card payments',async()=>{
 process.env.RESEARCH_COMMERCE_ENABLED='true';process.env.STRIPE_RESEARCH_APPROVED='true';
 await withRedis(async()=>{for(const [handler,extra] of [[quote,{asset:'BTC'}],[card,{channel:'email'}]]){const output=res();await handler(request({...extra,researchApprovalCode:'f'.repeat(64),approved:true}),output);assert.equal(output.code,403);assert.equal(output.body.sent,undefined);assert.equal(output.body.quoteToken,undefined);}});
});
test('pending, rejected, revoked, expired and superseded approvals are rejected',()=>{
 for(const status of ['pending','rejected','revoked'])assert.throws(()=>access.assertApproved({...approved(),status},order,customer),/approval/);
 assert.throws(()=>access.assertApproved({...approved(),expiresAt:Date.now()-1},order,customer),/approval/);
 assert.throws(()=>access.assertApproved({...approved(),policyVersion:'old'},order,customer),/approval/);
});
test('an approval cannot be reused for another customer, address, amount, quantity or fulfillment',()=>{
 assert.throws(()=>access.assertApproved(approved(),order,{...customer,email:'other@lab.example'}),/differ/);
 assert.throws(()=>access.assertApproved(approved(),order,{...customer,address:'another address'}),/differ/);
 assert.throws(()=>access.assertApproved(approved(),normalizeOrder([{key:'bpc157-10::0',qty:2}],'shipping'),customer),/differ/);
 assert.throws(()=>access.assertApproved(approved(),{...order,totalCents:order.totalCents-100},customer),/differ/);
 assert.throws(()=>access.assertApproved(approved(),{...order,mode:'pickup'},customer),/differ/);
});
test('verified access is bound to one payment route and a fixed order reference',async()=>{
 process.env.RESEARCH_COMMERCE_ENABLED='true';
 await withRedis(async()=>{const approvedRecord=await access.requireApproval({researchApprovalCode:code},order,customer,'crypto:BTC');assert.equal(approvedRecord.orderId,'NXT-REVIEW-TEST-123');await assert.rejects(()=>access.requireApproval({researchApprovalCode:code},order,customer,'card'),/different payment route/);});
});
test('database outage cannot authorize payment',async()=>{
 const old=global.fetch;global.fetch=async()=>{throw new Error('offline')};
 try{await assert.rejects(()=>access.requireApproval({researchApprovalCode:code},order,customer,'card'),/unavailable/);}finally{global.fetch=old;}
});
test('request API saves only pending records and does not return credentials or approve applicants',async()=>{
 await withRedis(async({values,emails})=>{const output=res();await apply(request(),output);assert.equal(output.code,202);assert.equal(output.body.status,'pending');assert.equal(output.body.researchApprovalCode,undefined);assert.equal(output.body.customer,undefined);const saved=JSON.parse(values.get(access.key(output.body.reference)));assert.equal(saved.status,'pending');assert.equal(saved.research.policyVersion,access.POLICY_VERSION);assert.equal(saved.expiresAt,undefined);assert.equal(emails.length,1);assert.doesNotMatch(emails[0].html,/checkout\.stripe\.com/);});
});
test('missing attestation and organization details fail before persistence',async()=>{
 const old=global.fetch;global.fetch=()=>{throw new Error('Unexpected network')};
 try{const req=request();req.body.research.attestation=false;const output=res();await apply(req,output);assert.equal(output.code,400);assert.equal(output.body.reference,undefined);}finally{global.fetch=old;}
});
test('pickup requests still require a complete organization address',async()=>{
 const req=request({fulfillment:'pickup',customer:{...customer,address:''}});const output=res();await apply(req,output);assert.equal(output.code,400);
});
test('application rate limit prevents excess records and notification spam',async()=>{
 await withRedis(async()=>{for(let i=0;i<6;i++){const output=res();await apply(request(),output);assert.equal(output.code,i<5?202:429);}});
});
test('invalid origins cannot submit research requests',async()=>{
 const req=request();req.headers.origin='https://attacker.example';const output=res();await apply(req,output);assert.equal(output.code,403);
});
test('supplemental source no longer exposes dosing, administration or unsupported purity claims',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 for(const file of ['cjc-products.js','pt141-product.js','bac-water-product.js','glutathione-product.js']){
  const context={compounds:[]};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
  for(const p of context.compounds){assert.equal(p.dosing,undefined);assert.equal(p.injectionSite,undefined);assert.equal(p.reconstitution,undefined);assert.deepEqual(Array.from(p.suggestedCompanions),[]);assert.doesNotMatch(JSON.stringify(p),/99%|fat-loss|skin-beauty|dose-dependent|exercise endurance/);}
 }
});
