// PT-141 10mg — freeze-dried research product
// Added as a native catalog entry so it renders like the existing listings.

if (typeof compounds !== 'undefined' && Array.isArray(compounds) && !compounds.some(p => p.id === 'pt141-10')) {
  compounds.push({
    id: 'pt141-10',
    name: 'PT-141 — 10mg',
    aka: 'Bremelanotide Research Peptide',
    category: 'freeze-dried',
    protocols: [],
    badge: 'New',
    tags: ['Melanocortin', 'Receptor Research', 'Cyclic Peptide', 'Lyophilized', 'Research Grade'],
    shortDesc: 'Lyophilized cyclic peptide for laboratory melanocortin receptor and signaling research.',
    description: 'PT-141 (bremelanotide) is a synthetic cyclic heptapeptide used in laboratory research involving melanocortin receptor signaling, receptor-binding behavior, and related biochemical pathways. This listing is supplied as a 10mg lyophilized research product and is not intended for human or veterinary use.',
    benefits: [
      'Suitable for melanocortin receptor signaling research',
      'Useful for receptor-binding and pathway studies',
      'Lyophilized format for controlled laboratory handling',
      '10mg research vial format',
      'Intended for analytical and in-vitro research workflows'
    ],
    sideEffects: ['Not applicable — laboratory research product only'],
    dosing: {
      beginner: { dose: 'Research use only', frequency: 'Per validated protocol', duration: 'Study dependent', notes: 'No human dosing information provided' },
      intermediate: { dose: 'Research use only', frequency: 'Per validated protocol', duration: 'Study dependent', notes: 'Follow your laboratory SOP and study design' },
      advanced: { dose: 'Research use only', frequency: 'Per validated protocol', duration: 'Study dependent', notes: 'Not for human or veterinary administration' }
    },
    amount: '10mg per vial',
    form: 'Lyophilized Powder',
    appearance: 'White / Off-White Powder',
    purity: '>99% Research Grade',
    molecularFormula: 'C50H68N14O10',
    halfLife: 'Study dependent',
    reconstitution: 'Use only a validated laboratory preparation protocol appropriate to the intended analytical study.',
    syringe: 'Laboratory handling equipment as required by protocol',
    injectionSite: 'Not applicable — not for human or veterinary use',
    storage: 'Store lyophilized material under controlled, protected laboratory conditions according to the product COA/SOP.',
    administration: 'Laboratory research use only',
    warnings: 'For laboratory research and analytical use only. Not for human consumption, medical use, veterinary use, diagnosis, treatment, or self-administration.',
    suggestedCompanions: [],
    pricing: [
      { label: '1 Vial', price: 45.00 },
      { label: '5 Vials', price: 184.50 },
      { label: '10 Vials', price: 315.00 }
    ]
  });
}
