// Separate CJC-1295 10mg freeze-dried research listings.
// Market-aligned single-vial pricing checked August 2026.
(() => {
  if (typeof compounds === 'undefined' || !Array.isArray(compounds)) return;

  const products = [
    {
      id: 'cjc1295-dac-10',
      name: 'CJC-1295 with DAC — 10mg',
      aka: 'Long-Acting GHRH Analog',
      category: 'freeze-dried',
      protocols: ['energy-vitality', 'recovery-longevity'],
      badge: '',
      tags: ['GHRH', 'DAC', 'Long-Acting', 'GH Axis', 'Research'],
      shortDesc: 'DAC-modified CJC-1295 for laboratory research involving GHRH signaling and extended peptide stability.',
      description: 'CJC-1295 with DAC is a synthetic GHRH analog incorporating a Drug Affinity Complex (DAC). It is supplied here as a lyophilized 10mg research material for controlled laboratory and analytical research.',
      benefits: ['GHRH receptor research', 'Extended peptide stability studies', 'GH-axis signaling research', 'DAC albumin-binding research'],
      sideEffects: ['Research material — not for human or veterinary use'],
      dosing: {
        beginner: { dose: 'N/A', frequency: 'Laboratory use only', duration: 'Study dependent', notes: 'Follow the laboratory study protocol.' },
        intermediate: { dose: 'N/A', frequency: 'Laboratory use only', duration: 'Study dependent', notes: 'Not intended for human or veterinary use.' },
        advanced: { dose: 'N/A', frequency: 'Laboratory use only', duration: 'Study dependent', notes: 'Use qualified laboratory handling procedures.' }
      },
      amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
      purity: 'Research Grade', molecularFormula: 'CJC-1295 DAC', halfLife: 'Study dependent',
      reconstitution: 'Follow validated laboratory protocol.', syringe: 'Laboratory handling equipment', injectionSite: 'Not applicable — laboratory research only.',
      storage: 'Store according to supplied research documentation.', administration: 'Laboratory research only',
      warnings: 'For laboratory research use only. Not for human or veterinary use.',
      suggestedCompanions: ['ipamorelin', 'sermorelin', 'tesamorelin-10'],
      pricing: [
        { label: '1 Vial', price: 65 },
        { label: '2 Vials', price: 130 },
        { label: '3 Vials', price: 195 },
        { label: '4 Vials', price: 260 },
        { label: '5 Vials', price: 325 }
      ]
    },
    {
      id: 'cjc1295-no-dac-10',
      name: 'CJC-1295 without DAC — 10mg',
      aka: 'Modified GRF (1-29)',
      category: 'freeze-dried',
      protocols: ['energy-vitality', 'recovery-longevity'],
      badge: '',
      tags: ['GHRH', 'No DAC', 'Modified GRF', 'GH Axis', 'Research'],
      shortDesc: 'CJC-1295 without DAC (Modified GRF 1-29) for laboratory research involving GHRH signaling and peptide kinetics.',
      description: 'CJC-1295 without DAC, commonly called Modified GRF (1-29), is a synthetic GHRH analog without the Drug Affinity Complex modification. It is supplied here as a lyophilized 10mg research material.',
      benefits: ['GHRH receptor research', 'Peptide kinetics research', 'GH-axis signaling research', 'Comparative DAC/no-DAC studies'],
      sideEffects: ['Research material — not for human or veterinary use'],
      dosing: {
        beginner: { dose: 'N/A', frequency: 'Laboratory use only', duration: 'Study dependent', notes: 'Follow the laboratory study protocol.' },
        intermediate: { dose: 'N/A', frequency: 'Laboratory use only', duration: 'Study dependent', notes: 'Not intended for human or veterinary use.' },
        advanced: { dose: 'N/A', frequency: 'Laboratory use only', duration: 'Study dependent', notes: 'Use qualified laboratory handling procedures.' }
      },
      amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
      purity: 'Research Grade', molecularFormula: 'Modified GRF (1-29)', halfLife: 'Study dependent',
      reconstitution: 'Follow validated laboratory protocol.', syringe: 'Laboratory handling equipment', injectionSite: 'Not applicable — laboratory research only.',
      storage: 'Store according to supplied research documentation.', administration: 'Laboratory research only',
      warnings: 'For laboratory research use only. Not for human or veterinary use.',
      suggestedCompanions: ['ipamorelin', 'sermorelin', 'tesamorelin-10'],
      pricing: [
        { label: '1 Vial', price: 60 },
        { label: '2 Vials', price: 120 },
        { label: '3 Vials', price: 180 },
        { label: '4 Vials', price: 240 },
        { label: '5 Vials', price: 300 }
      ]
    }
  ];

  products.forEach(product => {
    const index = compounds.findIndex(existing => existing.id === product.id);
    if (index >= 0) compounds[index] = product;
    else compounds.push(product);
  });
})();
