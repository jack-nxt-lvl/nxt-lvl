// Glutathione 1500mg — freeze-dried research product
// Native catalog entry matching the existing NXT LVL product schema.

if (typeof compounds !== 'undefined' && Array.isArray(compounds) && !compounds.some(p => p.id === 'glutathione-1500')) {
  compounds.push({
    id: 'glutathione-1500',
    name: 'Glutathione — 1.5g',
    aka: 'Reduced Glutathione (GSH)',
    category: 'freeze-dried',
    protocols: ['recovery-longevity', 'skin-beauty'],
    badge: 'New',
    tags: ['Antioxidant Research', 'Redox Biology', 'Oxidative Stress', 'Detox Pathways', 'Lyophilized'],
    shortDesc: '1500mg lyophilized glutathione in a 10mL vial for laboratory antioxidant and redox-pathway research.',
    description: 'Glutathione (GSH) is a naturally occurring tripeptide composed of glutamate, cysteine, and glycine. It is widely studied in laboratory research involving cellular redox balance, oxidative-stress pathways, glutathione-dependent enzyme systems, mitochondrial function, and detoxification-related biochemistry. This product contains 1.5g (1500mg) of lyophilized glutathione supplied in a 10mL vial for research use only.',
    benefits: [
      'Supports laboratory research into cellular antioxidant systems',
      'Useful for studying glutathione-dependent redox pathways',
      'Commonly referenced in oxidative-stress and mitochondrial research',
      'Relevant to glutathione peroxidase and related enzyme-system studies',
      'Lyophilized 1500mg format for controlled laboratory handling'
    ],
    sideEffects: ['Not applicable — laboratory research product only'],
    dosing: {
      beginner: { dose: 'Research use only', frequency: 'Per validated protocol', duration: 'Study dependent', notes: 'No human dosing or injection guidance provided' },
      intermediate: { dose: 'Research use only', frequency: 'Per validated protocol', duration: 'Study dependent', notes: 'Follow laboratory SOP and study design' },
      advanced: { dose: 'Research use only', frequency: 'Per validated protocol', duration: 'Study dependent', notes: 'Not for human or veterinary administration' }
    },
    amount: '1.5g (1500mg) per 10mL vial',
    form: 'Lyophilized Powder',
    appearance: 'White / Off-White Powder',
    purity: 'Research Grade',
    molecularFormula: 'C10H17N3O6S',
    halfLife: 'Study dependent',
    reconstitution: 'Use only a validated laboratory preparation protocol appropriate to the intended analytical study.',
    syringe: 'Laboratory handling equipment as required by protocol',
    injectionSite: 'Not applicable — not for human or veterinary use',
    storage: 'Store lyophilized material under controlled laboratory conditions and protect from heat, moisture, and direct light according to the product COA/SOP.',
    administration: 'Laboratory research use only',
    warnings: 'For laboratory research and analytical use only. Not for human consumption, medical use, veterinary use, diagnosis, treatment, or self-administration.',
    suggestedCompanions: ['bac-water-10ml'],
    pricing: [
      { label: '1 Vial', price: 79.00 },
      { label: '5 Vials', price: 324.00 },
      { label: '10 Vials', price: 553.00 }
    ]
  });
}
