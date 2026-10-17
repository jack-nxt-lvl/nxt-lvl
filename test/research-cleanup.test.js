const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {compounds, stacks, protocols} = require('../products-data-original');
const {normalizeOrder} = require('../lib/direct-payment');
const chat = require('../api/chat');
const read = file => fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const removed = ['mk677','rad140','bpc157-tabs','anastrozole','slu332','anavar-25','anavar-50','winstrol','test-e','test-c','equipoise','deca','masteron','npp','tren-ace','hgh-10'];

test('withdrawn offers cannot be purchased through the trusted server catalog', () => {
 for (const id of removed) {
  assert.equal(compounds.some(p=>p.id===id),false,id);
  assert.throws(()=>normalizeOrder([{key:id+'::0',qty:1}],'pickup'),undefined,id);
 }
});
test('published catalog and product modal omit human-use instructions', () => {
 for(const p of compounds) {
  for(const key of ['dosing','injectionSite','syringe','administration','reconstitution']) assert.equal(p[key],undefined,p.id+':'+key);
  assert.equal(p.suggestedCompanions.length,0);
 }
 assert.equal(stacks.length,0); assert.equal(protocols.length,0);
 assert.doesNotMatch(read('index.html'),/p\.dosing|Dosing Protocol|Starting Dose|Injection Site|Key Benefits|Suggested Stacks/);
});
test('AI rejects personal-use requests without invoking a model or suggesting purchases', async () => {
 const res={status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
 await chat({method:'POST',body:{messages:[{role:'user',content:'What should I buy for weight loss?'}]}},res);
 assert.equal(res.code,200);
 assert.match(res.body.reply,/cannot recommend/);
 assert.doesNotMatch(res.body.reply,/retatrutide|checkout|Ready to/);
 assert.equal(chat.isHumanUseRequest([{role:'user',content:'Do you have a batch COA?'}]),false);
});
test('local inquiry prepares an encoded draft without submitting or sending it', () => {
 let handler;
 const window={location:{href:''}};
 vm.runInNewContext(read('local-research.js'),{window,encodeURIComponent,FormData:class{get(k){return {city:'Miami & 33101',method:'Pickup appointment inquiry'}[k];}},document:{getElementById(){return{addEventListener(event,fn){handler=fn;}};}}});
 handler.call({}, {preventDefault(){}});
 const target=new URL(window.location.href);
 assert.equal(target.origin,'https://wa.me');
 assert.equal(target.pathname,'/17542907210');
 assert.match(target.searchParams.get('text'),/Miami & 33101/);
 assert.match(target.searchParams.get('text'),/Pickup appointment inquiry/);
});
test('local inquiry preserves material details in WhatsApp, text and email drafts', () => {
 for (const channel of ['whatsapp','sms','email']) {
  let handler;
  const field={value:''};
  const window={location:{href:'',search:'?material=GHK-Cu%2050mg'}};
  const values={city:'Fort Lauderdale & 33315',method:'Local delivery inquiry',organization:'A&B Lab',material:'GHK-Cu 50mg',quantity:'2 vials',channel};
  const form={querySelector(){return field;},addEventListener(event,fn){handler=fn;}};
  vm.runInNewContext(read('local-research.js'),{window,URLSearchParams,encodeURIComponent,FormData:class{get(k){return values[k];}},document:{getElementById(){return form;}}});
  assert.equal(field.value,'GHK-Cu 50mg');
  assert.equal(window.location.href,'');
  handler.call(form,{preventDefault(){}});
  const target=new URL(window.location.href);
  assert.equal(target.protocol,{whatsapp:'https:',sms:'sms:',email:'mailto:'}[channel]);
  if(channel==='email')assert.equal(target.pathname,'payment@nxtlvl-research.com');
  if(channel==='sms')assert.equal(target.pathname,'+17542907210');
  const body=target.searchParams.get(channel==='whatsapp'?'text':'body');
  assert.match(body,/Fort Lauderdale & 33315/);
  assert.match(body,/A&B Lab/);
  assert.match(body,/GHK-Cu 50mg/);
  assert.match(body,/2 vials/);
  assert.match(body,/not a confirmed order/);
 }
});
test('local structured data uses the owner-supplied business address without inventing a local branch or hours', () => {
 const html=read('south-florida-research.html');
 for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  const schema=JSON.parse(match[1]);
  assert.equal(schema['@graph'][0].telephone,'+1-754-290-7210');
  assert.equal(schema['@graph'][0].legalName,'BLUE LIGHT VENTURES LLC');
  assert.deepEqual(schema['@graph'][0].address,{'@type':'PostalAddress',streetAddress:'30 N Gould St, Ste R',addressLocality:'Sheridan',addressRegion:'WY',postalCode:'82801',addressCountry:'US'});
  assert.doesNotMatch(match[1],/openingHours|aggregateRating|LocalBusiness/);
 }
 assert.match(html,/tel:\+17542907210/);assert.match(html,/sms:\+17542907210/);
 assert.match(read('robots.txt'),/https:\/\/www\.nxtlvl-research\.com\/sitemap.xml/);
 assert.doesNotMatch(read('sitemap.xml'),/hgh-10iu|oral-research-compounds/);
});
