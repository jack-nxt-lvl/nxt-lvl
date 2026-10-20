// Fixed-content purchasing packages. Shared by the storefront and trusted checkout.
// A package groups separate vials; it does not recommend combined use.
(function () {
  'use strict';
  const DISCOUNT_PERCENT = 5;
  const DEFINITIONS = Object.freeze([
    { id:'pack-bpc157-tb500', name:'BPC-157 10mg + TB-500 10mg', ids:['bpc157-10','tb500-10'] },
    { id:'pack-cjc-no-dac-ipamorelin', name:'CJC-1295 without DAC 10mg + Ipamorelin 10mg', ids:['cjc1295-no-dac-10','ipamorelin'] },
    { id:'pack-tesamorelin-ipamorelin', name:'Tesamorelin 10mg + Ipamorelin 10mg', ids:['tesamorelin-10','ipamorelin'] },
    { id:'pack-sermorelin-ipamorelin', name:'Sermorelin 10mg + Ipamorelin 10mg', ids:['sermorelin','ipamorelin'] },
  ].map(d=>Object.freeze({...d,ids:Object.freeze(d.ids)})));

  function buildResearchPackages(materials) {
    const byId=new Map(materials.map(p=>[p.id,p]));
    return DEFINITIONS.map(definition=>{
      const components=definition.ids.map(id=>{
        const product=byId.get(id);
        const single=product?.pricing?.find(p=>/^1 Vial\b/i.test(p.label));
        const unitCents=Math.round(Number(single?.price)*100);
        if(!product||!Number.isSafeInteger(unitCents)||unitCents<=0) throw new Error('Missing package component: '+id);
        return {productId:id,name:product.name,amount:'10mg per vial',quantity:1,unitCents};
      });
      const singlesCents=components.reduce((sum,c)=>sum+c.unitCents*c.quantity,0);
      const packageCents=Math.round(singlesCents*(100-DISCOUNT_PERCENT)/100);
      const contents=components.map(c=>'1 × '+c.name).join('; ');
      return {
        id:definition.id,name:definition.name+' — research pack',category:'research-packages',
        path:'/research-package-deals.html#'+definition.id,
        amount:'2 separate vials · 10mg per vial',form:'Separate lyophilized materials',
        aka:'5% package savings · '+contents,shortDesc:contents+'. Separate labeled vials for laboratory procurement.',
        description:contents+'. This package contains one vial of each named material. The price includes 5% savings compared with the current individual single-vial prices. Review the availability and lot documentation of each component before payment. A shared purchase does not establish compatibility or suitability for combined use. No solvent or administration supplies are included.',
        badge:'Save 5%',tags:['Separate vials','5% package savings'],protocols:[],benefits:[],sideEffects:[],suggestedCompanions:[],
        warnings:'Qualified laboratory research only. Not for human or veterinary use. Confirm each component and its lot documentation before payment.',
        purity:'Refer to each component’s lot-specific report',storage:'Request handling documentation for each component.',
        components,singlesCents,packageCents,savingsCents:singlesCents-packageCents,discountPercent:DISCOUNT_PERCENT,
        pricing:[{label:'1 Package · 2 separate vials · Save 5%',price:packageCents/100}],
      };
    });
  }
  const api=Object.freeze({DISCOUNT_PERCENT,DEFINITIONS,buildResearchPackages});
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  if(typeof window!=='undefined') window.NxtResearchPackages=api;
  if(typeof document!=='undefined'&&typeof compounds!=='undefined'&&Array.isArray(compounds)) {
    const packages=buildResearchPackages(compounds);
    for(const p of packages) {
      const index=compounds.findIndex(item=>item.id===p.id);
      if(index<0)compounds.push(p);else compounds[index]=p;
    }
    if(typeof categories!=='undefined'&&!categories.some(c=>c.id==='research-packages')) categories.push({id:'research-packages',name:'Package Deals'});
    if(typeof renderFilters==='function')renderFilters();
    if(typeof renderGrid==='function')renderGrid('all');
  }
})();
