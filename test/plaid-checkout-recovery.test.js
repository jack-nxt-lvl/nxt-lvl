const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const vm=require('node:vm');

const source=readFileSync(join(__dirname,'..','plaid-checkout.js'),'utf8');
const saved={orderId:'NXT-ABC123-ABCDEF',receipt:'a'.repeat(64)};

function fixture(initial,fetchImpl) {
  const store=new Map(initial ? [['nxtPlaidOrderV1',JSON.stringify(initial)]] : []);
  const document={activeElement:null};
  class Element {
    constructor(tag){this.tagName=tag;this.children=[];this.textContent='';}
    appendChild(child){child.parent=this;this.children.push(child);return child;}
    prepend(child){child.parent=this;this.children.unshift(child);}
    remove(){if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this);}
    focus(){document.activeElement=this;}
    set innerHTML(_value){
      const card=this.appendChild(new Element('div'));card.className='nxt-checkout-card';
      card.appendChild(new Element('h2'));card.appendChild(new Element('p'));
      const actions=card.appendChild(new Element('div'));actions.className='nxt-checkout-actions';
      actions.appendChild(new Element('button'));
    }
    querySelector(selector){return this.querySelectorAll(selector)[0] || null;}
    querySelectorAll(selector){
      const result=[];
      for(const child of this.children){
        if(selector.startsWith('.') ? child.className===selector.slice(1) : selector.startsWith('#') ? child.id===selector.slice(1) : child.tagName===selector)result.push(child);
        result.push(...child.querySelectorAll(selector));
      }
      return result;
    }
  }
  document.body=new Element('body');document.createElement=tag=>new Element(tag);
  document.getElementById=id=>document.body.querySelector('#'+id);
  const sessionStorage={getItem:key=>store.get(key),setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)};
  const window={location:{assign(){}}};
  vm.runInNewContext(source,{window,document,sessionStorage,fetch:fetchImpl,AbortSignal});
  return {window,document,sessionStorage,store};
}

test('a saved receipt restores a status control without activating or requesting a new payment',async()=>{
  const calls=[];
  const f=fixture(saved,async(path,options)=>{
    calls.push({path,body:JSON.parse(options.body)});
    return {ok:true,json:async()=>({orderId:saved.orderId,totalCents:10000,status:'processing'})};
  });
  const recovery=f.document.getElementById('nxtBankPaymentRecovery');
  assert.equal(recovery.textContent,'Check bank payment');
  assert.equal(calls.length,0);
  await recovery.onclick();
  assert.equal(calls.length,1);
  assert.equal(calls[0].body.action,'status');
  assert.equal(calls[0].body.orderId,saved.orderId);
  const panel=f.document.body.querySelector('.nxt-checkout-overlay');
  const close=panel.querySelectorAll('button').find(button=>button.textContent!=='Refresh status');
  close.onclick();
  assert.equal(f.document.getElementById('nxtBankPaymentRecovery'),recovery);
  await recovery.onclick();
  assert.equal(calls.length,2);
  assert.ok(calls.every(call=>call.body.action==='status'));
});

test('invalid saved receipts cannot create a recovery control or send status requests',async()=>{
  for(const bad of [null,{}, {...saved,receipt:'short'},{...saved,orderId:'bad-order'},'not an order']){
    let calls=0;
    const f=fixture(bad,async()=>{calls++;throw new Error('Unexpected request');});
    assert.equal(f.document.getElementById('nxtBankPaymentRecovery'),null);
    await f.window.NxtPlaidCheckout.showStatus();
    assert.equal(calls,0);
  }
});

test('saved extra fields cannot change the status action sent to the server',async()=>{
  const f=fixture({...saved,action:'start',items:[{key:'unexpected'}]},async(_path,options)=>{
    const body=JSON.parse(options.body);
    assert.deepEqual(body,{action:'status',...saved});
    return {ok:true,json:async()=>({orderId:saved.orderId,totalCents:10000,status:'pending'})};
  });
  await f.window.NxtPlaidCheckout.showStatus();
});

test('preparing-payment panel is visible during async start and removed on failure',async()=>{
  let rejectRequest;
  const f=fixture(null,()=>new Promise((_resolve,reject)=>{rejectRequest=reject;}));
  const result=f.window.NxtPlaidCheckout.start({customer:{},total:100,fulfillment:'shipping'},[]);
  assert.equal(f.document.body.querySelector('h2').textContent,'Preparing secure bank payment');
  assert.equal(f.document.body.querySelector('button').disabled,true);
  rejectRequest(new Error('Network unavailable'));
  await assert.rejects(result,/Network unavailable/);
  assert.equal(f.document.body.querySelector('.nxt-checkout-overlay'),null);
});
