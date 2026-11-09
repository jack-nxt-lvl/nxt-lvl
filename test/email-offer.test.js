const test = require('node:test');
const assert = require('node:assert/strict');
const offer = require('../api/email-offer');
const createQuote = require('../api/create-direct-payment-quote');
const lead = require('../api/checkout-lead');
const {normalizeOrder,verifyQuote} = require('../lib/direct-payment');
const {discountedOrder, VERSION} = require('../lib/email-offer');
const {buildStripeCheckoutForm} = require('../lib/hosted-card-link');

function call(handler,body) {
  const req={method:'POST',headers:{origin:'https://www.nxtlvl-research.com'},body};
  const res={setHeader(){},status(code){this.code=code;return this;},end(data){this.body=JSON.parse(data);}};
  return handler(req,res).then(()=>res);
}

test('email code is saved, delivered, bound to the address and honored through signed checkout',async t=>{
  process.env.PAYMENT_LEDGER_KV_REST_API_URL='https://redis.example.test';
  process.env.PAYMENT_LEDGER_KV_REST_API_TOKEN='mock-key';
  process.env.RESEND_API_KEY='mock-mail';
  process.env.CRYPTO_QUOTE_SECRET='email-offer-test-secret-at-least-32-characters';
  process.env.DIRECT_CRYPTO_CHECKOUT_ENABLED='true';
  const records=new Map(),mail=[];
  let failDelivery=true;
  t.mock.method(global,'fetch',async (url,options)=>{
    if(url==='https://api.resend.com/emails'){
      if(failDelivery)return Response.json({message:'Unavailable'},{status:503});
      mail.push(JSON.parse(options.body));return Response.json({id:'sent'});
    }
    assert.equal(url,process.env.PAYMENT_LEDGER_KV_REST_API_URL);
    const cmd=JSON.parse(options.body);let result;
    if(cmd[0]==='EVAL' && cmd[1].includes('HSET')){
      const [, , , , field, serialized, now]=cmd;
      const previous=records.get(field);
      result=previous && JSON.parse(previous).expiresAt>now?previous:serialized;
      records.set(field,result);
    }else if(cmd[0]==='HGET'){result=records.get(cmd[2])||null;}
    else {result=cmd[0]==='SET'?'OK':1;}
    return Response.json({result});
  });
  const email='purchasing@example.test';
  const signup={action:'signup',email,consent:true};
  assert.equal((await call(offer,{...signup,consent:false})).code,400);
  assert.equal((await call(offer,signup)).code,503);
  failDelivery=false;
  const sent=await call(offer,signup);assert.equal(sent.code,200);
  const code=mail[0].html.match(/NXT-[A-F0-9]{12}/)[0];
  assert.ok(!JSON.stringify(sent.body).includes(code));
  await call(offer,signup);assert.equal(records.size,1);assert.ok(mail[1].html.includes(code));
  const items=[{key:'ghk-cu-100::0',qty:2}],fulfillment='shipping';
  const fields={action:'apply',code,email,items,fulfillment};
  const applied=await call(offer,fields);
  assert.deepEqual(applied.body,{discountCents:2180,discountedSubtotalCents:19620,shippingCents:1200,totalCents:20820});
  assert.equal((await call(offer,{...fields,email:'other@example.test'})).code,400);
  const body={asset:'USDT',items,fulfillment,promoCode:code,customer:{name:'QA Lab',email,phone:'5555550100',address:'1 Lab Way',city:'Miami',state:'FL',zip:'33137'},researchConsent:{attestation:true,policyVersion:'2026-10-17-final-sale'}};
  const quote=await call(createQuote,body);assert.equal(quote.code,200);assert.equal(quote.body.totalUsd,'208.20');
  assert.equal(verifyQuote(quote.body.quoteToken).offerVersion,VERSION);
  const [key,record]=Array.from(records)[0];records.set(key,JSON.stringify({...JSON.parse(record),expiresAt:0}));
  assert.equal((await call(offer,fields)).code,400);
  assert.equal((await call(lead,{...body,quoteToken:quote.body.quoteToken})).code,200);
  assert.match(mail.at(-1).html,/208\.20/);
  assert.equal((await call(createQuote,{...body,promoCode:undefined,discountCents:10000})).body.totalUsd,'218.00');
});

test('rounded merchandise discounts and hosted-card line totals agree to the cent',()=>{
  const order=discountedOrder(normalizeOrder([{key:'ghk-cu-50::1',qty:3},{key:'ghk-cu-100::1',qty:2}],'overnight'),VERSION);
  const form=buildStripeCheckoutForm({order,customer:{email:'purchasing@example.test',name:'QA Lab',phone:'5555550100'},orderId:'test'});
  let total=0;
  for(let i=0;form.has('line_items['+i+'][quantity]');i++)total+=Number(form.get('line_items['+i+'][quantity]'))*Number(form.get('line_items['+i+'][price_data][unit_amount]'));
  assert.equal(total,order.totalCents);
  assert.equal(order.discountCents,Math.round(order.subtotalCents/10));
});
