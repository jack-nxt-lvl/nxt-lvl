// 10mL Bacteriostatic Water — catalog product
// Native product entry for All Compounds and Peptides (Freeze-Dried).

if (typeof compounds !== 'undefined' && Array.isArray(compounds) && !compounds.some(p => p.id === 'bac-water-10ml')) {
  compounds.push({
    id: 'bac-water-10ml',
    name: 'Bacteriostatic Water — 10mL',
    aka: '0.9% Benzyl Alcohol Reconstitution Water',
    category: 'freeze-dried',
    protocols: [],
    badge: '',
    tags: ['Reconstitution', '10mL', '0.9% Benzyl Alcohol', 'Multi-Use Vial', 'Laboratory Supply'],
    shortDesc: '10mL bacteriostatic water containing 0.9% benzyl alcohol for controlled laboratory reconstitution workflows.',
    description: 'Bacteriostatic water is sterile water preserved with 0.9% benzyl alcohol. The preservative helps inhibit bacterial growth after repeated vial access, making it useful for controlled laboratory reconstitution and sample-preparation workflows where a preserved aqueous diluent is appropriate. Supplied in a 10mL vial.',
    benefits: [
      '10mL preserved aqueous diluent',
      'Contains 0.9% benzyl alcohol as a bacteriostatic preservative',
      'Designed for controlled reconstitution and sample preparation',
      'Multi-access vial format',
      'Convenient companion supply for lyophilized research products'
    ],
    sideEffects: ['Not applicable — laboratory supply listing'],
    dosing: {
      beginner: { dose: 'Use per laboratory protocol', frequency: 'As required', duration: 'Protocol dependent', notes: 'Use only the volume specified by the applicable validated procedure' },
      intermediate: { dose: 'Use per laboratory protocol', frequency: 'As required', duration: 'Protocol dependent', notes: 'Maintain aseptic handling and vial integrity' },
      advanced: { dose: 'Use per laboratory protocol', frequency: 'As required', duration: 'Protocol dependent', notes: 'Follow laboratory SOP, labeling, and storage requirements' }
    },
    amount: '10mL per vial',
    form: 'Sterile Preserved Water',
    appearance: 'Clear, Colorless Liquid',
    purity: 'Sterile Water + 0.9% Benzyl Alcohol',
    molecularFormula: 'H₂O + C₇H₈O (0.9% benzyl alcohol)',
    halfLife: 'N/A',
    reconstitution: 'This product is the reconstitution diluent. Use only according to the applicable validated laboratory procedure.',
    syringe: 'Use sterile laboratory transfer equipment appropriate to the procedure',
    injectionSite: 'Not applicable — laboratory supply',
    storage: 'Store according to the product label and supplier instructions. Protect vial integrity and use aseptic technique after opening.',
    administration: 'Laboratory reconstitution / sample preparation',
    warnings: 'Laboratory supply. Use only for procedures for which bacteriostatic water with 0.9% benzyl alcohol is appropriate. Do not use if the vial, seal, clarity, or labeling appears compromised.',
    suggestedCompanions: [],
    pricing: [
      { label: '1 Vial', price: 10.00 },
      { label: '5 Vials', price: 41.00 },
      { label: '10 Vials', price: 70.00 }
    ]
  });
}
