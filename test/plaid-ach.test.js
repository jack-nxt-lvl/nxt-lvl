const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const file = path.join(__dirname,'../lib/plaid-ach.js');
const source = fs.readFileSync(file,'utf8');
const native = createRequire(file);
const id='NXT-ABCDEF-ABC123';
const buyer={name:'Purchaser',email:'lab@example.com'};
const body={items:[{key:'test::0',qty:1}],fulfillment:'shipping',customer:buyer,confirmedTotalCents:10200,
  accountClass:'web',researchConsent:{attestation:true,policyVersion:'v1'}};

function fixture() {
  const cache=new Map(), requests=[], emails=[];
  const intents=new Map();
  let seq=0, allow=true;
  const transfer={id:'tx',type:'debit',network:'ach',iso_currency_code:'USD',amount:'102.00',metadata:{nxt_order:id},status:'pending'};
  async function redis([cmd,k,value,...args]){
    if(cmd==='PING')return 'PONG';
    if(cmd==='GET')return cache.get(k) || null;
    if(cmd==='SET'){
      if(args.includes('NX') && cache.has(k))return null;
      cache.set(k,value);return 'OK';
    }
    if(cmd==='HSET'||cmd==='EXPIRE')return 1;
    if(cmd==='EVAL'){const [cursor,previous,next]=args;if(Number(cache.get(cursor)||0)!==Number(previous))return 0;cache.set(cursor,next);return 1;}
    throw Error(cmd);
  }
  const env={VERCEL_ENV:'preview',PLAID_ENV:'sandbox',PLAID_CLIENT_ID:'test',PLAID_SECRET:'test',PLAID_LINK_CUSTOMIZATION:'single',PLAID_ACH_ENABLED:'true',RESEARCH_COMMERCE_ENABLED:'true',RESEND_API_KEY:'test'};
  const base={id,mode:'shipping',totalCents:10200,normalizedItems:[],shippingCents:1200};
  const deps={
    './payment-ledger':{redisCommand:redis,ledgerConfigured:()=>true}, './crypto-checkout-access':{POLICY_VERSION:'v1'},
    './direct-payment':{normalizeOrder:()=>base,cleanCustomer:()=>buyer},
    './research-access':{requireApproval:async()=>{if(!allow)throw Error('unapproved');return {reference:'RR-123',orderId:id,research:{organization:'Test Lab'}};}},
    './email-offer':{priceForEmail:async o=>o},'./email':{escapeHtml:String,sendEmail:async m=>emails.push(m)}
  };
  let hookKey;
  const fetch=async(url,options)=>{
    const payload=JSON.parse(options.body);const endpoint=new URL(url).pathname;
    requests.push({endpoint,payload});
    let result;
    if(endpoint==='/transfer/intent/create'){const i=String(++seq);intents.set(i,{...payload,id:i,status:'PENDING'});result={transfer_intent:intents.get(i)};}
    else if(endpoint==='/transfer/intent/get')result={transfer_intent:intents.get(payload.transfer_intent_id)};
    else if(endpoint==='/link/token/create')result={hosted_link_url:'https://secure.plaid.com/hl/test'};
    else if(endpoint==='/transfer/get')result={transfer};
    else if(endpoint==='/transfer/event/sync')result={transfer_events:payload.after_id?[]:[{event_id:1,transfer_id:'tx',event_type:'funds_available'}]};
    else if(endpoint==='/webhook_verification_key/get')result={key:hookKey};
    else throw Error(endpoint);
    return {ok:true,json:async()=>result};
  };
  const mod={exports:{}};
  new Function('module','require','fetch','process',source)(mod,name=>deps[name]||native(name),fetch,{env});
  return {ach:mod.exports, env, requests, intents, transfer, emails, cache, refuse:()=>allow=false, setKey:key=>hookKey=key};
}

test('ACH is unavailable without matching credentials, activation, and the reviewed-order workflow',async()=>{
  const f=fixture();assert.equal(await f.ach.available(),true);
  for(const name of ['PLAID_CLIENT_ID','PLAID_SECRET','PLAID_ACH_ENABLED','RESEARCH_COMMERCE_ENABLED','PLAID_LINK_CUSTOMIZATION']){
    const original=f.env[name];delete f.env[name];assert.equal(await f.ach.available(),false,name);f.env[name]=original;
  }
  f.env.VERCEL_ENV='production';assert.equal(await f.ach.available(),false);
  await assert.rejects(f.ach.checkout(body));assert.equal(f.requests.length,0);
});

test('ACH verifies consent, order total and approval before creating any Plaid intent',async()=>{
  const f=fixture();
  for(const change of [{researchConsent:{}},{accountClass:'ppd'},{confirmedTotalCents:100}]){
    await assert.rejects(f.ach.checkout({...body,...change}));
  }
  f.refuse();await assert.rejects(f.ach.checkout(body),/unapproved/);assert.equal(f.requests.length,0);
});

test('simultaneous starts use one payable intent, with exact totals and the selected account holder',async()=>{
  const f=fixture();const business={...body,accountClass:'ccd'};
  const [first,second]=await Promise.all([f.ach.checkout(business),f.ach.checkout(business)]);
  assert.equal(first.receipt,second.receipt);assert.equal(first.url,'https://secure.plaid.com/hl/test');
  const links=f.requests.filter(x=>x.endpoint==='/link/token/create').map(x=>x.payload);
  assert.equal(new Set(links.map(x=>x.transfer.intent_id)).size,1);
  assert.deepEqual(links[0].products,['transfer']);
  const intent=f.intents.get(links[0].transfer.intent_id);
  assert.equal(intent.amount,'102.00');assert.equal(intent.user.legal_name,'Test Lab');assert.equal(intent.ach_class,'ccd');assert.equal(intent.mode,'PAYMENT');assert.equal(intent.network,'ach');
  await assert.rejects(f.ach.checkout(body),/account type/);
  await assert.rejects(f.ach.receiptStatus({orderId:id,receipt:'f'.repeat(64)}));
  intent.status='SUCCEEDED';intent.transfer_id='tx';
  const pending=await f.ach.checkout(business);assert.equal(pending.status,'pending');assert.equal(pending.url,undefined);
  f.transfer.amount='101.99';await assert.rejects(f.ach.receiptStatus(first),/reconciliation/);
});

test('notification replay, late returns and settlement holds preserve the real transfer status',async()=>{
  const f=fixture();const receipt=await f.ach.checkout(body);
  const intent=[...f.intents.values()][0];assert.equal(intent.user.legal_name,buyer.name);intent.status='SUCCEEDED';intent.transfer_id='tx';
  const event={event_id:1,transfer_id:'tx',event_type:'settled'};
  f.transfer.status='settled';await f.ach.handleEvent(event);assert.equal(f.emails.length,0);
  f.transfer.status='funds_available';await f.ach.syncEvents();await f.ach.syncEvents();assert.equal(f.emails.length,2);
  f.transfer.status='returned';await f.ach.handleEvent({...event,event_type:'returned'});await f.ach.handleEvent(event);
  assert.equal(f.emails.length,4);assert.match(f.emails[2].subject,/returned/);assert.equal((await f.ach.receiptStatus(receipt)).status,'returned');
});

test('Plaid webhook verification binds the signature to the raw body and its timestamp',async()=>{
  const f=fixture();const {privateKey,publicKey}=crypto.generateKeyPairSync('ec',{namedCurve:'P-256'});
  const kid='sandbox-key';f.setKey({...publicKey.export({format:'jwk'}),kid,alg:'ES256'});
  const raw=Buffer.from('{"webhook_type":"TRANSFER"}');
  function token(time,alg='ES256'){
    const encode=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
    const payload=encode({alg,kid})+'.'+encode({iat:time,request_body_sha256:crypto.createHash('sha256').update(raw).digest('hex')});
    return payload+'.'+crypto.sign('sha256',Buffer.from(payload),{key:privateKey,dsaEncoding:'ieee-p1363'}).toString('base64url');
  }
  const now=Math.floor(Date.now()/1000);
  await f.ach.verifyWebhook(raw,token(now));await assert.rejects(f.ach.verifyWebhook(raw,token(now-400)));
  await assert.rejects(f.ach.verifyWebhook(Buffer.from('{}'),token(now)));await assert.rejects(f.ach.verifyWebhook(raw,token(now,'none')));
  const valid=token(now);await assert.rejects(f.ach.verifyWebhook(raw,valid.slice(0,valid.lastIndexOf('.')+1)+Buffer.alloc(64).toString('base64url')));
});
