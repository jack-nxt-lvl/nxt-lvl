// Separate CJC-1295 10mg freeze-dried research listings.
// Research descriptions expanded August 2026.
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
      shortDesc: 'Long-acting GHRH analog incorporating a Drug Affinity Complex (DAC), designed for research into prolonged GHRH-receptor signaling, albumin binding, and GH/IGF-1 axis activity.',
      description: 'CJC-1295 with DAC is a synthetic analog of growth hormone-releasing hormone (GHRH). The DAC modification enables albumin binding and substantially extends circulating persistence compared with short-acting GHRH analogs. Published controlled human research on the DAC-bearing compound reported sustained, dose-dependent increases in growth hormone and IGF-1 and an estimated elimination half-life of approximately 5.8–8.1 days. This 10mg lyophilized material is offered strictly for qualified laboratory and analytical research.',
      benefits: [
        'GHRH receptor and endocrine-signaling research',
        'Long-duration peptide pharmacokinetic studies',
        'GH and IGF-1 axis research',
        'Albumin-binding and Drug Affinity Complex research',
        'Comparison of sustained versus pulsatile GHRH signaling',
        'Peptide stability and analytical characterization studies'
      ],
      sideEffects: ['Research material — not for human or veterinary use'],
      dosing: {
        beginner: { dose: 'N/A', frequency: 'Laboratory use only', duration: 'Study dependent', notes: 'Follow a validated laboratory study protocol.' },
        intermediate: { dose: 'N/A', frequency: 'Laboratory use only', duration: 'Study dependent', notes: 'Not intended for human or veterinary use.' },
        advanced: { dose: 'N/A', frequency: 'Laboratory use only', duration: 'Study dependent', notes: 'Use qualified laboratory handling procedures.' }
      },
      amount: '10mg per vial',
      form: 'Lyophilized Powder',
      appearance: 'White / Off-White Powder',
      purity: 'Research Grade',
      molecularFormula: 'CJC-1295 with DAC',
      halfLife: 'Published human research: approximately 5.8–8.1 days',
      reconstitution: 'Follow validated laboratory protocol.',
      syringe: 'Laboratory handling equipment',
      injectionSite: 'Not applicable — laboratory research only.',
      storage: 'Store according to supplied research documentation and validated laboratory procedures.',
      administration: 'Laboratory research only',
      warnings: 'For laboratory research use only. Not for human or veterinary use. Information presented is for research reference and is not medical advice.',
      suggestedCompanions: ['ipamorelin', 'sermorelin', 'tesamorelin-10'],
      pricing: [
        { label: '1 Vial', price: 89.99 },
        { label: '2 Vials', price: 179.98 },
        { label: '3 Vials', price: 269.97 },
        { label: '4 Vials', price: 359.96 },
        { label: '5 Vials', price: 449.95 }
      ]
    },
    {
      id: 'cjc1295-no-dac-10',
      name: 'CJC-1295 without DAC — 10mg',
      aka: 'Modified GRF (1-29) / Mod GRF 1-29',
      category: 'freeze-dried',
      protocols: ['energy-vitality', 'recovery-longevity'],
      badge: '',
      tags: ['GHRH', 'No DAC', 'Modified GRF', 'Short-Acting', 'GH Axis', 'Research'],
      shortDesc: 'Short-acting GHRH analog commonly called Modified GRF (1-29), used in research examining GHRH-receptor signaling, peptide kinetics, and pulsatile GH-axis activity.',
      description: 'CJC-1295 without DAC is commonly marketed as Modified GRF (1-29) or Mod GRF 1-29. It is a synthetic 29-amino-acid GHRH analog containing substitutions intended to improve stability relative to native GRF(1-29), but it does not contain the albumin-binding Drug Affinity Complex used in long-acting CJC-1295. The absence of DAC makes it a distinct, short-acting research molecule and makes it useful for comparative studies of brief versus prolonged GHRH-receptor signaling. This 10mg lyophilized material is supplied strictly for qualified laboratory and analytical research.',
      benefits: [
        'GHRH receptor and endocrine-signaling research',
        'Short-duration peptide kinetics research',
        'Pulsatile GH-axis signaling studies',
        'Modified GRF (1-29) analytical characterization',
        'Comparative DAC versus no-DAC research',
        'Peptide stability and degradation research'
      ],
      sideEffects: ['Research material — not for human or veterinary use'],
      dosing: {
        beginner: { dose: 'N/A', frequency: 'Laboratory use only', duration: 'Study dependent', notes: 'Follow a validated laboratory study protocol.' },
        intermediate: { dose: 'N/A', frequency: 'Laboratory use only', duration: 'Study dependent', notes: 'Not intended for human or veterinary use.' },
        advanced: { dose: 'N/A', frequency: 'Laboratory use only', duration: 'Study dependent', notes: 'Use qualified laboratory handling procedures.' }
      },
      amount: '10mg per vial',
      form: 'Lyophilized Powder',
      appearance: 'White / Off-White Powder',
      purity: 'Research Grade',
      molecularFormula: 'Modified GRF (1-29) / no DAC',
      halfLife: 'Short-acting; substantially shorter persistence than DAC-bearing CJC-1295',
      reconstitution: 'Follow validated laboratory protocol.',
      syringe: 'Laboratory handling equipment',
      injectionSite: 'Not applicable — laboratory research only.',
      storage: 'Store according to supplied research documentation and validated laboratory procedures.',
      administration: 'Laboratory research only',
      warnings: 'For laboratory research use only. Not for human or veterinary use. Published long-acting CJC-1295 clinical data should not be attributed directly to the no-DAC material.',
      suggestedCompanions: ['ipamorelin', 'sermorelin', 'tesamorelin-10'],
      pricing: [
        { label: '1 Vial', price: 89.99 },
        { label: '2 Vials', price: 179.98 },
        { label: '3 Vials', price: 269.97 },
        { label: '4 Vials', price: 359.96 },
        { label: '5 Vials', price: 449.95 }
      ]
    }
  ];

  products.forEach(product => {
    const index = compounds.findIndex(existing => existing.id === product.id);
    if (index >= 0) compounds[index] = product;
    else compounds.push(product);
  });
})();
