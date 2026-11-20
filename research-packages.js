// Fixed-content purchasing packages. Shared by the storefront and trusted checkout.
// A package groups separate vials; it does not recommend combined use.
(function () {
  'use strict';
  const DISCOUNT_PERCENT = 5;
  const DEFINITIONS = Object.freeze([
    { id:'pack-bpc157-tb500', name:'BPC-157 10mg + TB-500 10mg', ids:['bpc157-10','tb500-10'] },
    { id:'pack-cjc-no-dac-ipamorelin', name:'CJC-1295 without DAC 10mg + Ipamorelin 10mg', ids:['cjc1295-no-dac-10','ipamorelin'] },
    { id:'pack-tesamorelin-ipamorelin', name:'Tesamorelin 10mg + Ipamorelin 10mg', ids:['tesamorelin-10','ipamorelin'] },
    { id:'pack-mt2-ghk-cu-100', name:'Melanotan-2 (MT2) 10mg + GHK-Cu 100mg', ids:['mela2-10','ghk-cu-100'] },
    {
      id:'pack-semax-selank', name:'Semax 11mg + Selank 11mg', ids:['semax','selank'],
      comparison:'Semax and Selank are seven-amino-acid peptides with the same final three residues. Their first four residues differ.'
    },
    {
      id:'pack-mots-c-nad', name:'MOTS-c 10mg + NAD+ 500mg', ids:['mots-c','nad-500'],
      comparison:'MOTS-c is a mitochondria-encoded peptide. NAD+ is an electron carrier in mitochondrial metabolism.'
    },
    {
      id:'pack-cjc-dac-comparison', name:'CJC-1295 with DAC 10mg + CJC-1295 without DAC 10mg', ids:['cjc1295-dac-10','cjc1295-no-dac-10'],
      comparison:'Compare the DAC and no-DAC variants at the same labeled amount, with 10 mg of each in a separate vial.'
    },
    {
      id:'pack-kpv-glutathione', name:'KPV 10mg + Glutathione 1.5g', ids:['kpv-10','glutathione-1500'],
      comparison:'Both materials are tripeptides. KPV contains lysine, proline and valine. Glutathione contains glutamate, cysteine and glycine.'
    },
    { id:'pack-peptide-materials', name:'BPC-157 10mg + KPV 10mg — peptide materials', ids:['bpc157-10','kpv-10'] },
    { id:'pack-sermorelin-ipamorelin', name:'Sermorelin 10mg + Ipamorelin 10mg', ids:['sermorelin','ipamorelin'] },
    { id:'pack-ghk-cu-kpv', name:'GHK-Cu 50mg + KPV 10mg', ids:['ghk-cu-50','kpv-10'] },
    { id:'pack-aod-mots-c', name:'AOD-9604 10mg + MOTS-c 10mg', ids:['aod-9604','mots-c'] },
    { id:'pack-nad-glutathione', name:'NAD+ 500mg + Glutathione 1.5g', ids:['nad-500','glutathione-1500'] },
  ].map(d=>Object.freeze({...d,ids:Object.freeze(d.ids)})));

  function buildResearchPackages(materials) {
    const byId=new Map(materials.map(p=>[p.id,p]));
    return DEFINITIONS.map(definition=>{
      const components=definition.ids.map(id=>{
        const product=byId.get(id);
        const single=product?.pricing?.find(p=>/^1 Vial\b/i.test(p.label));
        const unitCents=Math.round(Number(single?.regularPrice ?? single?.price)*100);
        if(!product||!Number.isSafeInteger(unitCents)||unitCents<=0) throw new Error('Missing package component: '+id);
        return {productId:id,name:product.name,amount:product.amount || '10mg per vial',quantity:1,unitCents};
      });
      const singlesCents=components.reduce((sum,c)=>sum+c.unitCents*c.quantity,0);
      const packageCents=Math.round(singlesCents*(100-DISCOUNT_PERCENT)/100);
      const contents=components.map(c=>'1 × '+c.name).join('; ');
      const detail = definition.comparison || 'Separate labeled vials for laboratory procurement.';
      return {
        id:definition.id,name:definition.name+' — research pack',category:'research-packages',
        path:'/research-package-deals.html#'+definition.id,
        amount:'2 separate vials · amounts listed per component',form:'Separate lyophilized materials',
        aka:'5% package savings · '+contents,shortDesc:contents+'. '+detail,
        comparison:definition.comparison,
        description:contents+'. '+(definition.comparison ? detail+' ' : '')+'This package contains one vial of each named material. The price includes 5% savings compared with the current individual single-vial prices. In stock. Review the lot documentation of each component before payment. A shared purchase does not establish compatibility or suitability for combined use. No solvent or administration supplies are included.',
        badge:'In stock · Save 5%',availabilityNote:'In stock · Ready to ship. Dispatch in 1–2 business days after acceptance and payment; transit is additional. Review lot documentation before ordering.',tags:['Separate vials','5% package savings'],protocols:[],benefits:[],sideEffects:[],suggestedCompanions:[],
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
