// ══════════════════════════════════════════════
// NXT LVL — Complete Research Compound Database
// 2026 Full Menu — Updated Pricing
// ══════════════════════════════════════════════

const compounds = [

  // ═══════════════════════════════════════
  // FREEZE-DRIED PEPTIDES
  // ═══════════════════════════════════════
  {
    id: 'bpc157-10',
    name: 'BPC-157 — 10mg',
    aka: 'Body Protection Compound',
    category: 'freeze-dried',
    protocols: ['recovery-longevity'],
    badge: '',
    tags: ['Healing', 'Anti-Inflammatory', 'Tendon Repair', 'Angiogenesis', 'Gut Health'],
    shortDesc: 'Accelerates muscle and tendon healing while reducing inflammation and promoting angiogenesis.',
    description: 'BPC-157 is a synthetic peptide derived from a protective protein found in gastric juice. It accelerates the healing of muscles, tendons, and ligaments by promoting angiogenesis and modulating nitric oxide pathways. It also exhibits potent anti-inflammatory properties and cytoprotective effects on the GI tract.',
    benefits: ['Accelerates muscle and tendon healing', 'Reduces systemic inflammation', 'Promotes angiogenesis and blood vessel growth', 'Supports gut lining repair and GI health', 'May protect against NSAID-induced damage'],
    sideEffects: ['Mild nausea', 'Dizziness', 'Injection site redness', 'Headache'],
    dosing: {
      beginner: { dose: '250 mcg', frequency: '1x daily', duration: '4 weeks', notes: 'Inject close to injury site when possible' },
      intermediate: { dose: '350 mcg', frequency: '1x daily', duration: '6-8 weeks', notes: 'Can split dose AM/PM for sustained levels' },
      advanced: { dose: '500 mcg', frequency: '1-2x daily', duration: '8-12 weeks', notes: 'Bilateral injection near injury + systemically' }
    },
    amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₆₂H₉₈N₁₆O₂₂', halfLife: '~4 hours',
    reconstitution: 'Add 2 mL BAC water for 500 mcg per 0.1 mL.',
    syringe: 'Insulin syringe, 29-31 gauge', injectionSite: 'SubQ in abdominal fat or near injury site. IM also acceptable.',
    storage: 'Store at -4°F. Reconstituted: 36-46°F, use within 30 days.', administration: 'SubQ or IM',
    warnings: 'Research peptide not FDA-approved. Consult a physician. Avoid if pregnant or breastfeeding.',
    suggestedCompanions: ['tb500-10', 'tb500-bpc157', 'ghk-cu-100'],
    pricing: [ { label: '1 Vial', price: 65 }, { label: '5 Vials', price: 266.5 }, { label: '10 Vials', price: 455 } ]
  },
  {
    id: 'tb500-10',
    name: 'TB-500 — 10mg',
    aka: 'Thymosin Beta-4 Fragment',
    category: 'freeze-dried',
    protocols: ['recovery-longevity'],
    badge: '',
    tags: ['Tissue Repair', 'Flexibility', 'Wound Healing', 'Anti-Inflammatory', 'Recovery'],
    shortDesc: 'Promotes systemic tissue repair, flexibility, and accelerates wound healing.',
    description: 'TB-500 is a synthetic version of Thymosin Beta-4. It plays a critical role in tissue repair by upregulating actin, promoting cell migration, and reducing inflammation. Works systemically throughout the body.',
    benefits: ['Promotes systemic tissue repair', 'Improves flexibility and range of motion', 'Accelerates wound healing', 'Reduces chronic inflammation', 'Supports new blood vessel growth'],
    sideEffects: ['Head rush after injection', 'Temporary lethargy', 'Injection site irritation', 'Mild headache'],
    dosing: {
      beginner: { dose: '2 mg', frequency: '2x per week', duration: '4 weeks', notes: 'Loading phase; reduce to maintenance after' },
      intermediate: { dose: '2.5 mg', frequency: '2x per week', duration: '4-6 weeks', notes: 'Standard protocol for moderate injuries' },
      advanced: { dose: '2.5 mg', frequency: '2-3x per week', duration: '6 weeks', notes: 'Stack with BPC-157 for synergistic healing' }
    },
    amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₂₁₂H₃₅₀N₅₆O₇₈S', halfLife: '~2-3 days',
    reconstitution: 'Add 2 mL BAC water for 2.5 mg per 0.5 mL.',
    syringe: 'Insulin syringe, 29-31 gauge', injectionSite: 'SubQ in abdominal fat. Systemic action — site less critical.',
    storage: 'Store at -4°F. Reconstituted: 36-46°F, use within 21 days.', administration: 'SubQ',
    warnings: 'Not FDA-approved. Avoid with active cancer due to angiogenic effects. Consult a physician.',
    suggestedCompanions: ['bpc157-10', 'tb500-bpc157', 'ghk-cu-100'],
    pricing: [ { label: '1 Vial', price: 80 }, { label: '5 Vials', price: 328 }, { label: '10 Vials', price: 560 } ]
  },
  {
    id: 'tb500-bpc157',
    name: 'TB-500 + BPC-157 — 10mg',
    aka: 'Recovery Blend',
    category: 'freeze-dried',
    protocols: ['recovery-longevity'],
    badge: '',
    tags: ['Healing Stack', 'Tissue Repair', 'Angiogenesis', 'Cell Migration', 'Synergy'],
    shortDesc: 'Pre-combined recovery blend for synergistic tissue repair and healing.',
    description: 'BPC-157 and TB-500 combined in a single vial for complementary local (BPC-157) and systemic (TB-500) healing pathways.',
    benefits: ['Synergistic tissue repair (local + systemic)', 'Promotes angiogenesis and cell migration', 'Dual anti-inflammatory pathways', 'Convenient single-vial dosing', 'Comprehensive injury recovery'],
    sideEffects: ['Mild nausea', 'Injection site irritation', 'Temporary lethargy', 'Headache'],
    dosing: {
      beginner: { dose: '0.3 mL', frequency: '1x daily', duration: '4 weeks', notes: 'Balanced dose of both compounds' },
      intermediate: { dose: '0.5 mL', frequency: '1x daily', duration: '6-8 weeks', notes: 'Inject near injury for BPC-157 benefit' },
      advanced: { dose: '0.5 mL', frequency: '1-2x daily', duration: '8-12 weeks', notes: 'AM near injury + PM SubQ abdomen' }
    },
    amount: '10mg per vial (blend)', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'Blend', halfLife: '~4 hrs (BPC) / ~2-3 days (TB)',
    reconstitution: 'Add 2 mL BAC water to the 10mg blend vial.',
    syringe: 'Insulin syringe, 29-31 gauge', injectionSite: 'SubQ in abdominal fat or near injury.',
    storage: 'Store at -4°F. Reconstituted: 36-46°F, use within 21 days.', administration: 'SubQ or IM',
    warnings: 'Research compounds. Not for individuals with active cancer. Consult a physician.',
    suggestedCompanions: ['ghk-cu-100', 'nad-500', 'ipamorelin'],
    pricing: [ { label: '1 Vial', price: 60 }, { label: '5 Vials', price: 246 }, { label: '10 Vials', price: 420 } ]
  },
  {
    id: 'tesamorelin-10',
    name: 'Tesamorelin — 10mg',
    aka: 'GHRH Analog',
    category: 'freeze-dried',
    protocols: ['fat-loss', 'energy-vitality'],
    badge: '',
    tags: ['Growth Hormone', 'Fat Loss', 'GHRH', 'Body Composition', 'IGF-1'],
    shortDesc: 'GHRH analog that stimulates endogenous GH production for body composition research.',
    description: 'Tesamorelin is a GHRH analog investigated for growth hormone axis research. It stimulates endogenous GH production, elevating IGF-1 levels and influencing fat distribution, metabolic health markers, and muscle preservation.',
    benefits: ['Stimulates natural growth hormone release', 'Studied for visceral fat reduction', 'Elevates IGF-1 levels', 'May support muscle preservation', 'FDA-approved analog exists for lipodystrophy'],
    sideEffects: ['Injection site reactions', 'Joint pain', 'Peripheral edema', 'Muscle pain', 'Paresthesia'],
    dosing: {
      beginner: { dose: '1 mg', frequency: '1x daily', duration: '8 weeks', notes: 'Inject on empty stomach before bed' },
      intermediate: { dose: '1.5-2 mg', frequency: '1x daily', duration: '12 weeks', notes: 'Consistent daily dosing is key' },
      advanced: { dose: '2 mg', frequency: '1x daily', duration: '12-24 weeks', notes: 'Combine with Ipamorelin for enhanced GH' }
    },
    amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₂₂₁H₃₆₆N₇₂O₆₇S', halfLife: '~26 minutes',
    reconstitution: 'Add 5 mL BAC water for 2mg/mL.',
    syringe: 'Insulin syringe, 29-31 gauge', injectionSite: 'SubQ in abdominal fat.',
    storage: 'Store at -4°F. Reconstituted: 36-46°F, use within 28 days.', administration: 'SubQ',
    warnings: 'Research peptide. Inject on empty stomach. Consult a physician.',
    suggestedCompanions: ['ipamorelin', 'sermorelin', 'cjc1295'],
    pricing: [ { label: '1 Vial', price: 75 }, { label: '5 Vials', price: 307.5 }, { label: '10 Vials', price: 525 } ]
  },
  {
    id: 'sermorelin',
    name: 'Sermorelin — 10mg',
    aka: 'GHRH Analog',
    category: 'freeze-dried',
    protocols: ['energy-vitality'],
    badge: '',
    tags: ['Growth Hormone', 'GHRH', 'Anti-Aging', 'Sleep', 'Recovery'],
    shortDesc: 'GHRH analog that stimulates natural pulsatile GH release from the pituitary.',
    description: 'Sermorelin is a synthetic GHRH (Growth Hormone Releasing Hormone) analog consisting of the first 29 amino acids of endogenous GHRH. It stimulates the pituitary gland to produce and release growth hormone in a natural, pulsatile manner.',
    benefits: ['Stimulates natural GH production', 'Improves sleep quality', 'Supports lean body composition', 'Promotes recovery and repair', 'Well-established safety profile'],
    sideEffects: ['Injection site reactions', 'Flushing', 'Headache', 'Dizziness', 'Hyperactivity'],
    dosing: {
      beginner: { dose: '200-300 mcg', frequency: '1x daily before bed', duration: '8-12 weeks', notes: 'Inject on empty stomach' },
      intermediate: { dose: '300 mcg', frequency: '1x daily before bed', duration: '12 weeks', notes: 'Pair with Ipamorelin for synergy' },
      advanced: { dose: '300-500 mcg', frequency: '1x daily before bed', duration: '3-6 months', notes: 'Long-term protocols are common' }
    },
    amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₁₄₉H₂₄₆N₄₄O₄₂S', halfLife: '~10-20 minutes',
    reconstitution: 'Add 2 mL BAC water for 5mg/mL.',
    syringe: 'Insulin syringe, 29-31 gauge', injectionSite: 'SubQ in abdominal fat.',
    storage: 'Store at -4°F. Reconstituted: 36-46°F, use within 28 days.', administration: 'SubQ',
    warnings: 'Research peptide. Inject on empty stomach before bed. Consult a physician.',
    suggestedCompanions: ['ipamorelin', 'tesamorelin-10', 'mk677'],
    pricing: [ { label: '1 Vial', price: 65 }, { label: '5 Vials', price: 266.5 }, { label: '10 Vials', price: 455 } ]
  },
  {
    id: 'ipamorelin',
    name: 'Ipamorelin — 10mg',
    aka: 'Selective GH Secretagogue',
    category: 'freeze-dried',
    protocols: ['fat-loss', 'energy-vitality', 'recovery-longevity'],
    badge: '',
    tags: ['Growth Hormone', 'Recovery', 'Clean GH Release', 'Anti-Aging', 'Lean Mass'],
    shortDesc: 'Clean GH secretagogue — stimulates GH release without cortisol or prolactin spikes.',
    description: 'Ipamorelin is a highly selective growth hormone secretagogue (GHS) that stimulates natural GH release by binding to the ghrelin receptor (GHS-R1a). Unlike other GHRPs, it does not significantly affect cortisol or prolactin, making it one of the cleanest GH peptides.',
    benefits: ['Clean GH pulse without cortisol/prolactin spikes', 'Promotes lean muscle growth and recovery', 'Supports fat metabolism', 'Improves sleep quality and REM cycles', 'Enhances joint and connective tissue health'],
    sideEffects: ['Mild headache', 'Water retention', 'Tingling in extremities', 'Injection site irritation'],
    dosing: {
      beginner: { dose: '200 mcg', frequency: '1x daily before bed', duration: '8-12 weeks', notes: 'Inject on empty stomach, 2+ hrs after eating' },
      intermediate: { dose: '200-300 mcg', frequency: '2x daily (AM fasted + before bed)', duration: '12 weeks', notes: 'Best paired with CJC-1295 or Sermorelin' },
      advanced: { dose: '300 mcg', frequency: '3x daily', duration: '12-16 weeks', notes: 'Space doses 4-5 hours apart' }
    },
    amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White Powder',
    purity: '>99% (HPLC)', molecularFormula: 'C₃₈H₄₉N₉O₅', halfLife: '~2 hours',
    reconstitution: 'Add 2 mL BAC water for 200mcg per 0.04mL.',
    syringe: 'Insulin syringe, 29-31 gauge', injectionSite: 'SubQ in abdominal fat, thigh, or deltoid.',
    storage: 'Store at -4°F. Reconstituted: 36-46°F, use within 28 days.', administration: 'SubQ',
    warnings: 'Not FDA-approved. Administer on empty stomach. Not for individuals with active malignancies.',
    suggestedCompanions: ['sermorelin', 'tesamorelin-10', 'mk677'],
    pricing: [ { label: '1 Vial', price: 60 }, { label: '5 Vials', price: 246 }, { label: '10 Vials', price: 420 } ]
  },
  {
    id: 'mela2-10',
    name: 'Melanotan-2 — 10mg',
    aka: 'MT-2',
    category: 'freeze-dried',
    protocols: ['skin-beauty'],
    badge: '',
    tags: ['Pigmentation', 'Melanocortin', 'Tanning', 'Libido', 'Appetite'],
    shortDesc: 'Broad-spectrum melanocortin agonist for pigmentation and sexual health research.',
    description: 'Melanotan-2 is studied for skin pigmentation, photoprotection, and sexual health pathways. Binds MC-1, MC-3, and MC-4 receptors, influencing tanning, appetite, and energy balance.',
    benefits: ['Stimulates melanin for tanning', 'Broad melanocortin receptor activity', 'Studied for sexual health effects', 'May suppress appetite via MC-4', 'Potent tanning response'],
    sideEffects: ['Nausea', 'Facial flushing', 'Appetite suppression', 'Increased libido', 'Darkening of moles'],
    dosing: {
      beginner: { dose: '0.25 mg', frequency: '1x daily', duration: '2 weeks loading', notes: 'Start very low — nausea is common' },
      intermediate: { dose: '0.5 mg', frequency: '1x daily', duration: '2-4 weeks loading', notes: 'Maintenance: 0.5mg 1-2x/week once tan' },
      advanced: { dose: '0.5-1 mg', frequency: '1x daily', duration: '3-4 weeks', notes: 'Quick transition to maintenance' }
    },
    amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₅₀H₆₉N₁₅O₉', halfLife: '~1 hour',
    reconstitution: 'Add 2 mL BAC water for 5mg/mL.',
    syringe: 'Insulin syringe, 29-31 gauge', injectionSite: 'SubQ in abdominal fat.',
    storage: 'Store at -4°F. Reconstituted: 36-46°F, use within 30 days.', administration: 'SubQ',
    warnings: 'Monitor moles closely. Not for melanoma history. Not a substitute for sunscreen.',
    suggestedCompanions: ['mela1-10', 'ghk-cu-100', 'nad-500'],
    pricing: [ { label: '1 Vial', price: 50 }, { label: '5 Vials', price: 205 }, { label: '10 Vials', price: 350 } ]
  },
  {
    id: 'mela1-10',
    name: 'Melanotan-1 — 10mg',
    aka: 'MT-1 / Afamelanotide',
    category: 'freeze-dried',
    protocols: ['skin-beauty'],
    badge: '',
    tags: ['Pigmentation', 'Selective', 'Photoprotection', 'UV Defense', 'Tanning'],
    shortDesc: 'Selective melanocortin receptor agonist for pigmentation without systemic side effects.',
    description: 'Melanotan 1 selectively targets melanocortin receptors for pigmentation without the systemic effects (appetite, libido) of MT-2.',
    benefits: ['Selective melanocortin activity', 'Stimulates melanin production', 'Studied for photoprotection', 'Fewer systemic side effects than MT-2', 'May reduce UV-induced damage'],
    sideEffects: ['Nausea', 'Facial flushing', 'Injection site irritation', 'Darkening of moles', 'Mild fatigue'],
    dosing: {
      beginner: { dose: '0.5 mg', frequency: '1x daily', duration: '2-3 weeks', notes: 'Loading phase until desired pigmentation' },
      intermediate: { dose: '1 mg', frequency: '1x daily', duration: '2-4 weeks', notes: 'Maintenance: 0.5mg 2-3x/week' },
      advanced: { dose: '1 mg', frequency: '1x daily', duration: '4 weeks', notes: 'Monitor mole changes closely' }
    },
    amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₇₈H₁₁₁N₂₁O₁₉', halfLife: '~30 minutes',
    reconstitution: 'Add 2 mL BAC water for 5mg/mL.',
    syringe: 'Insulin syringe, 29-31 gauge', injectionSite: 'SubQ in abdominal fat.',
    storage: 'Store at -4°F. Reconstituted: 36-46°F, use within 30 days.', administration: 'SubQ',
    warnings: 'Monitor moles. Not for melanoma history. Use sunscreen. Consult a physician.',
    suggestedCompanions: ['mela2-10', 'ghk-cu-100', 'nad-500'],
    pricing: [ { label: '1 Vial', price: 50 }, { label: '5 Vials', price: 205 }, { label: '10 Vials', price: 350 } ]
  },
  {
    id: 'nad-500',
    name: 'NAD+ — 500mg',
    aka: 'Nicotinamide Adenine Dinucleotide',
    category: 'freeze-dried',
    protocols: ['energy-vitality', 'recovery-longevity'],
    badge: '',
    tags: ['Cellular Energy', 'Anti-Aging', 'Mitochondria', 'DNA Repair', 'Longevity'],
    shortDesc: 'Essential coenzyme for cellular energy, DNA repair, and anti-aging pathways.',
    description: 'NAD+ is studied for cellular energy production, sirtuin activation, DNA repair, and mitochondrial function. Levels decline with age, making it a key target in longevity research.',
    benefits: ['Supports ATP production', 'Activates sirtuins (longevity genes)', 'Promotes DNA repair', 'Enhances mitochondrial function', 'Anti-aging and neuroprotective'],
    sideEffects: ['Flushing', 'Nausea', 'Injection site discomfort', 'Cramping', 'Chest pressure (IV)'],
    dosing: {
      beginner: { dose: '50-100 mg', frequency: '2-3x per week', duration: '4 weeks', notes: 'SubQ or slow IV. Start low.' },
      intermediate: { dose: '100-250 mg', frequency: '3x per week', duration: '8 weeks', notes: 'Increase gradually' },
      advanced: { dose: '250-500 mg', frequency: '3-5x per week', duration: '8-12 weeks', notes: 'IV recommended at higher doses' }
    },
    amount: '500mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₂₁H₂₇N₇O₁₄P₂', halfLife: '~2-4 hours',
    reconstitution: 'Add 5 mL BAC water for 100mg/mL.',
    syringe: 'Insulin syringe for SubQ; IV setup for infusions', injectionSite: 'SubQ abdomen for low doses. IV for higher.',
    storage: 'Store at -4°F. Reconstituted: 36-46°F, use within 14 days.', administration: 'SubQ or IV',
    warnings: 'IV administration should be supervised. Start low. May cause flushing/nausea.',
    suggestedCompanions: ['ghk-cu-100', 'mots-c', 'ipamorelin'],
    pricing: [ { label: '1 Vial', price: 80 }, { label: '5 Vials', price: 328 }, { label: '10 Vials', price: 560 } ]
  },
  {
    id: 'ghk-cu-50',
    name: 'GHK-Cu — 50mg',
    aka: 'Copper Peptide',
    category: 'freeze-dried',
    protocols: ['recovery-longevity', 'skin-beauty'],
    badge: '',
    tags: ['Collagen', 'Skin', 'Anti-Aging', 'Wound Repair', 'Copper'],
    shortDesc: 'Copper-binding peptide for collagen remodeling, wound repair, and skin health.',
    description: 'GHK-Cu naturally occurs in plasma and declines with age. Studied for collagen remodeling, wound repair, hair follicle activation, and antioxidant capacity.',
    benefits: ['Stimulates collagen and elastin', 'Promotes wound healing', 'Hair follicle activation', 'Anti-inflammatory and antioxidant', 'DNA repair support'],
    sideEffects: ['Injection site redness', 'Blue/green discoloration', 'Mild skin irritation', 'Mild nausea'],
    dosing: {
      beginner: { dose: '1-2 mg', frequency: '1x daily', duration: '4 weeks', notes: 'SubQ or topical' },
      intermediate: { dose: '2-3 mg', frequency: '1x daily', duration: '6-8 weeks', notes: 'SubQ + microneedling with topical' },
      advanced: { dose: '3-5 mg', frequency: '1x daily', duration: '8-12 weeks', notes: 'Combine SubQ with topical' }
    },
    amount: '50mg per vial', form: 'Lyophilized Powder', appearance: 'Blue / Green Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₁₄H₂₄N₆O₄Cu', halfLife: '~2-3 hours',
    reconstitution: 'Add 2.5 mL BAC water for 20mg/mL.',
    syringe: 'Insulin syringe, 29-31 gauge', injectionSite: 'SubQ or topical near target area.',
    storage: 'Store at -4°F. Reconstituted: 36-46°F, use within 30 days.', administration: 'SubQ or Topical',
    warnings: 'Blue/green color is normal (copper complex). Consult a physician.',
    suggestedCompanions: ['bpc157-10', 'nad-500', 'mela1-10'],
    pricing: [ { label: '1 Vial', price: 50 }, { label: '5 Vials', price: 205 }, { label: '10 Vials', price: 350 } ]
  },
  {
    id: 'ghk-cu-100',
    name: 'GHK-Cu — 100mg',
    aka: 'Copper Peptide',
    category: 'freeze-dried',
    protocols: ['recovery-longevity', 'skin-beauty'],
    badge: 'Best Seller',
    tags: ['Collagen', 'Skin', 'Anti-Aging', 'Wound Repair', 'Value'],
    shortDesc: 'Higher-dose copper peptide for extended skin and connective tissue protocols.',
    description: 'GHK-Cu 100mg vial — same compound, double the concentration for cost-effective extended protocols targeting collagen, skin rejuvenation, and wound repair.',
    benefits: ['Stimulates collagen and elastin', 'Promotes wound healing', 'Hair follicle activation', 'Cost-effective for extended protocols', 'DNA repair support'],
    sideEffects: ['Injection site redness', 'Blue/green discoloration', 'Mild skin irritation', 'Mild nausea'],
    dosing: {
      beginner: { dose: '1-2 mg', frequency: '1x daily', duration: '4 weeks', notes: 'SubQ or topical' },
      intermediate: { dose: '2-3 mg', frequency: '1x daily', duration: '6-8 weeks', notes: 'SubQ + topical combo' },
      advanced: { dose: '3-5 mg', frequency: '1x daily', duration: '8-12 weeks', notes: 'Combine SubQ with topical' }
    },
    amount: '100mg per vial', form: 'Lyophilized Powder', appearance: 'Blue / Green Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₁₄H₂₄N₆O₄Cu', halfLife: '~2-3 hours',
    reconstitution: 'Add 5 mL BAC water for 20mg/mL.',
    syringe: 'Insulin syringe, 29-31 gauge', injectionSite: 'SubQ or topical.',
    storage: 'Store at -4°F. Reconstituted: 36-46°F, use within 30 days.', administration: 'SubQ or Topical',
    warnings: 'Blue/green color is normal. Consult a physician.',
    suggestedCompanions: ['bpc157-10', 'nad-500', 'mela1-10'],
    pricing: [ { label: '1 Vial', price: 65 }, { label: '5 Vials', price: 266.5 }, { label: '10 Vials', price: 455 } ]
  },
  {
    id: 'glow-70',
    name: 'GLOW — 70mg',
    aka: 'GHK-Cu + BPC-157 + TB-500 + KPV',
    category: 'freeze-dried',
    protocols: ['recovery-longevity', 'skin-beauty'],
    badge: 'New',
    tags: ['4-Peptide Blend', 'Recovery', 'Skin', 'Anti-Inflammatory', 'Collagen'],
    shortDesc: 'Advanced 4-peptide blend for tissue repair, inflammation control, and skin regeneration.',
    description: 'GLOW is a high-purity blend combining GHK-Cu (collagen), BPC-157 (tissue repair), TB-500 (systemic healing), and KPV (anti-inflammatory). Targets multiple recovery and regeneration pathways simultaneously.',
    benefits: ['Synergistic 4-compound formula', 'Targets tissue repair + skin health', 'GHK-Cu for collagen synthesis', 'BPC-157 + TB-500 for healing', 'KPV for inflammation control'],
    sideEffects: ['Injection site irritation', 'Mild nausea', 'Lethargy', 'Skin discoloration (copper)', 'Headache'],
    dosing: {
      beginner: { dose: '0.3 mL', frequency: '1x daily', duration: '4 weeks', notes: 'Balanced dose of all 4 compounds' },
      intermediate: { dose: '0.5 mL', frequency: '1x daily', duration: '6-8 weeks', notes: 'Rotate injection sites' },
      advanced: { dose: '0.5 mL', frequency: '1-2x daily', duration: '8-12 weeks', notes: 'Split AM/PM dosing' }
    },
    amount: '70mg per vial (blend)', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '≥99%', molecularFormula: 'Blend', halfLife: 'Varies by compound',
    reconstitution: 'Add 2-4 mL BAC water.',
    syringe: 'Insulin syringe, 29-31 gauge', injectionSite: 'SubQ in abdominal fat or near target area.',
    storage: 'Store at -4°F. Reconstituted: 36-46°F, use within 21 days.', administration: 'SubQ',
    warnings: 'Contains copper complex. Not for active cancer. Consult a physician.',
    suggestedCompanions: ['nad-500', 'mela1-10', 'ipamorelin'],
    pricing: [ { label: '1 Vial', price: 85 }, { label: '5 Vials', price: 348.5 }, { label: '10 Vials', price: 595 } ]
  },
  {
    id: 'mots-c',
    name: 'MOTS-c — 10mg',
    aka: 'Mitochondrial Peptide',
    category: 'freeze-dried',
    protocols: ['energy-vitality', 'recovery-longevity'],
    badge: '',
    tags: ['Mitochondria', 'Metabolic', 'Exercise Mimetic', 'Longevity', 'Energy'],
    shortDesc: 'Mitochondrial-derived peptide studied for metabolic regulation and exercise-mimetic effects.',
    description: 'MOTS-c is a mitochondrial-derived peptide that targets the AMPK pathway. Research shows it may regulate metabolic homeostasis, improve insulin sensitivity, and provide exercise-mimetic effects at the cellular level.',
    benefits: ['Activates AMPK pathway', 'Studied for metabolic regulation', 'Exercise-mimetic effects', 'May improve insulin sensitivity', 'Supports mitochondrial function'],
    sideEffects: ['Injection site reactions', 'Mild fatigue', 'Headache', 'Limited long-term data'],
    dosing: {
      beginner: { dose: '5 mg', frequency: '3x per week', duration: '4 weeks', notes: 'SubQ on non-training days' },
      intermediate: { dose: '5-10 mg', frequency: '3x per week', duration: '6-8 weeks', notes: 'Can take on training days for synergy' },
      advanced: { dose: '10 mg', frequency: '3-5x per week', duration: '8-12 weeks', notes: 'Cycle 8 on / 4 off' }
    },
    amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₇₈H₁₂₂N₂₂O₂₃S₂', halfLife: '~12 hours',
    reconstitution: 'Add 1 mL BAC water for 10mg/mL.',
    syringe: 'Insulin syringe, 29-31 gauge', injectionSite: 'SubQ in abdominal fat.',
    storage: 'Store at -4°F. Reconstituted: 36-46°F, use within 14 days.', administration: 'SubQ',
    warnings: 'Novel peptide with limited human data. Start at lower dose. Consult a physician.',
    suggestedCompanions: ['nad-500', 'slu332', 'ipamorelin'],
    pricing: [ { label: '1 Vial', price: 75 }, { label: '5 Vials', price: 307.5 }, { label: '10 Vials', price: 525 } ]
  },
  {
  id: 'hgh-10',
  name: 'HGH — 150 IU Kit',
  aka: 'Human Growth Hormone • 10 Vials × 15 IU',
  category: 'freeze-dried',
  protocols: ['energy-vitality', 'fat-loss', 'recovery-longevity'],
  badge: 'SAVE UP TO 25%',
  tags: ['Growth Hormone', '150 IU Kit', '10 × 15 IU Vials', 'GH / IGF-1 Research', 'Body Composition Research', 'Recovery Research'],
  shortDesc: '150 IU HGH research kit with 10 freeze-dried vials at 15 IU each. Multi-kit savings increase with quantity — get 25% off when you get 5 kits.',
  description: 'HGH (somatropin) is recombinant human growth hormone used in laboratory research involving GH/IGF-1 signaling, protein turnover, lipid metabolism, body-composition pathways, connective-tissue signaling, recovery biology, bone metabolism, and glucose/metabolic markers. Each kit contains 150 IU total across 10 freeze-dried vials with 15 IU per vial. Multi-kit savings increase with quantity, with 5 kits priced at 25% off.',
  benefits: [
    'GH and IGF-1 signaling research',
    'Protein synthesis and lean-tissue pathway research',
    'Lipid metabolism and body-composition research',
    'Recovery and tissue-repair pathway research',
    'Connective-tissue and collagen signaling research',
    'Bone metabolism research',
    'Sleep and recovery physiology research',
    'Glucose and metabolic-marker research'
  ],
  sideEffects: ['Research use only — effects and safety depend on study design', 'GH signaling can affect glucose regulation and fluid balance', 'Not intended for human or veterinary use'],
  dosing: {
    beginner: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'No human-use dosing guidance provided.' },
    intermediate: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Use only within an appropriate laboratory research protocol.' },
    advanced: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Follow laboratory study design and handling requirements.' }
  },
  amount: '150 IU total per kit — 10 vials × 15 IU each',
  form: 'Freeze-Dried / Lyophilized Powder',
  appearance: 'White / Off-White Powder',
  purity: '>99% (HPLC Verified)',
  molecularFormula: 'Somatropin (191-amino-acid recombinant human growth hormone)',
  halfLife: 'Research context and route dependent',
  reconstitution: 'Follow the supplied laboratory handling and reconstitution instructions for the specific research protocol.',
  syringe: 'Laboratory research handling only',
  injectionSite: 'Not for human or veterinary use',
  storage: 'Store according to supplied product handling instructions. Refrigerate appropriately after laboratory reconstitution.',
  administration: 'Laboratory research use only',
  warnings: 'For laboratory research use only. Not for human consumption, medical, veterinary, or diagnostic use.',
  suggestedCompanions: ['mots-c', 'nad-500', 'ghk-cu-100'],
  pricing: [
    { label: '1 Kit — 150 IU', price: 450 },
    { label: '2 Kits — 5% OFF', price: 855 },
    { label: '3 Kits — 10% OFF', price: 1215 },
    { label: '4 Kits — 15% OFF', price: 1530 },
    { label: '5 Kits — 25% OFF • BEST VALUE', price: 1687.5 }
  ]
},
  {
    id: 'retatrutide-10',
    name: 'Retatrutide — 10mg',
    aka: 'Tri-Agonist (GLP-1/GIP/Glucagon)',
    category: 'freeze-dried',
    protocols: ['fat-loss'],
    badge: 'Best Seller',
    tags: ['GLP-1', 'GIP', 'Glucagon', 'Tri-Agonist', 'Metabolic'],
    shortDesc: 'Triple receptor agonist for advanced metabolic and body-composition research.',
    description: 'Retatrutide is an investigational tri-agonist targeting GLP-1, GIP, and glucagon receptors simultaneously. It is studied in controlled research settings for metabolic signaling, appetite pathways, and body-composition outcomes.',
    benefits: ['Triple receptor agonist (GLP-1/GIP/Glucagon)', 'Metabolic signaling research', 'Body-composition pathway research', 'Appetite-regulation research', 'Sustained weekly activity'],
    sideEffects: ['Research use only — effects and safety depend on study design', 'Investigational compound with no approved consumer use', 'Not intended for human or veterinary use'],
    dosing: {
      beginner: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'No human-use dosing guidance provided.' },
      intermediate: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Use only within an appropriate laboratory research protocol.' },
      advanced: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Follow laboratory study design and handling requirements.' }
    },
    amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₁₉₀H₂₈₂N₄₈O₆₀', halfLife: 'Research context dependent',
    reconstitution: 'Follow the supplied laboratory handling and reconstitution instructions for the specific research protocol.',
    syringe: 'Laboratory research handling only', injectionSite: 'Not for human or veterinary use',
    storage: 'Store according to supplied product handling instructions. Refrigerate appropriately after laboratory reconstitution.', administration: 'Laboratory research use only',
    warnings: 'For laboratory research use only. Not for human consumption, medical, veterinary, or diagnostic use.',
    suggestedCompanions: ['retatrutide-20', 'tesamorelin-10', 'mots-c'],
    pricing: [ { label: '1 Vial', price: 110 }, { label: '5 Vials', price: 451 }, { label: '10 Vials', price: 770 } ]
  },
  {
    id: 'retatrutide-20',
    name: 'Retatrutide — 20mg',
    aka: 'Tri-Agonist (GLP-1/GIP/Glucagon)',
    category: 'freeze-dried',
    protocols: ['fat-loss'],
    badge: '',
    tags: ['GLP-1', 'GIP', 'Glucagon', 'Tri-Agonist', '20mg Vial'],
    shortDesc: 'Higher-concentration Retatrutide vial for advanced metabolic research protocols.',
    description: 'Retatrutide is an investigational tri-agonist targeting GLP-1, GIP, and glucagon receptors simultaneously. This 20mg format supports controlled laboratory studies requiring a higher quantity per vial.',
    benefits: ['Triple receptor agonist (GLP-1/GIP/Glucagon)', '20mg quantity per vial', 'Metabolic signaling research', 'Body-composition pathway research', 'Sustained weekly activity'],
    sideEffects: ['Research use only — effects and safety depend on study design', 'Investigational compound with no approved consumer use', 'Not intended for human or veterinary use'],
    dosing: {
      beginner: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'No human-use dosing guidance provided.' },
      intermediate: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Use only within an appropriate laboratory research protocol.' },
      advanced: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Follow laboratory study design and handling requirements.' }
    },
    amount: '20mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₁₉₀H₂₈₂N₄₈O₆₀', halfLife: 'Research context dependent',
    reconstitution: 'Follow the supplied laboratory handling and reconstitution instructions for the specific research protocol.',
    syringe: 'Laboratory research handling only', injectionSite: 'Not for human or veterinary use',
    storage: 'Store according to supplied product handling instructions. Refrigerate appropriately after laboratory reconstitution.', administration: 'Laboratory research use only',
    warnings: 'For laboratory research use only. Not for human consumption, medical, veterinary, or diagnostic use.',
    suggestedCompanions: ['retatrutide-10', 'tesamorelin-10', 'mots-c'],
    pricing: [ { label: '1 Vial', price: 160 }, { label: '5 Vials', price: 656 }, { label: '10 Vials', price: 1120 } ]
  },
  {
    id: 'hcg-5000',
    name: 'HCG — 5000 IU',
    aka: 'Human Chorionic Gonadotropin',
    category: 'freeze-dried',
    protocols: ['energy-vitality'],
    badge: '',
    tags: ['Hormone Research', 'LH Pathway', 'Endocrine Research', '5000 IU'],
    shortDesc: 'Freeze-dried HCG reference material for controlled endocrine and LH-pathway laboratory research.',
    description: 'HCG is a glycoprotein hormone used as a laboratory reference material in controlled endocrine and receptor-signaling research. This listing is the 5000 IU freeze-dried vial format.',
    benefits: ['LH-receptor pathway research', 'Endocrine signaling research', '5000 IU vial format', 'Lyophilized laboratory material'],
    sideEffects: ['Research use only — effects and safety depend on study design', 'Not intended for human or veterinary use'],
    dosing: {
      beginner: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'No human-use dosing guidance provided.' },
      intermediate: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Use only within an appropriate laboratory research protocol.' },
      advanced: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Follow laboratory study design and handling requirements.' }
    },
    amount: '5000 IU per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'Glycoprotein hormone reference material', halfLife: 'Research context dependent',
    reconstitution: 'Follow the supplied laboratory handling instructions for the specific research protocol.',
    syringe: 'Laboratory research handling only', injectionSite: 'Not for human or veterinary use',
    storage: 'Store according to supplied product handling instructions.', administration: 'Laboratory research use only',
    warnings: 'For laboratory research use only. Not for human consumption, medical, veterinary, or diagnostic use.',
    suggestedCompanions: ['hcg-10000'],
    pricing: [ { label: '1 Vial', price: 60 }, { label: '5 Vials', price: 246 }, { label: '10 Vials', price: 420 } ]
  },
  {
    id: 'hcg-10000',
    name: 'HCG — 10,000 IU',
    aka: 'Human Chorionic Gonadotropin',
    category: 'freeze-dried',
    protocols: ['energy-vitality'],
    badge: '',
    tags: ['Hormone Research', 'LH Pathway', 'Endocrine Research', '10,000 IU'],
    shortDesc: 'Higher-quantity freeze-dried HCG reference material for controlled endocrine laboratory research.',
    description: 'HCG is a glycoprotein hormone used as a laboratory reference material in controlled endocrine and receptor-signaling research. This listing is the 10,000 IU freeze-dried vial format.',
    benefits: ['LH-receptor pathway research', 'Endocrine signaling research', '10,000 IU vial format', 'Lyophilized laboratory material'],
    sideEffects: ['Research use only — effects and safety depend on study design', 'Not intended for human or veterinary use'],
    dosing: {
      beginner: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'No human-use dosing guidance provided.' },
      intermediate: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Use only within an appropriate laboratory research protocol.' },
      advanced: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Follow laboratory study design and handling requirements.' }
    },
    amount: '10,000 IU per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'Glycoprotein hormone reference material', halfLife: 'Research context dependent',
    reconstitution: 'Follow the supplied laboratory handling instructions for the specific research protocol.',
    syringe: 'Laboratory research handling only', injectionSite: 'Not for human or veterinary use',
    storage: 'Store according to supplied product handling instructions.', administration: 'Laboratory research use only',
    warnings: 'For laboratory research use only. Not for human consumption, medical, veterinary, or diagnostic use.',
    suggestedCompanions: ['hcg-5000'],
    pricing: [ { label: '1 Vial', price: 70 }, { label: '5 Vials', price: 287 }, { label: '10 Vials', price: 490 } ]
  },
  {
    id: 'semaglutide',
    name: 'Semaglutide — 10mg',
    aka: 'GLP-1 Receptor Agonist',
    category: 'freeze-dried',
    protocols: ['fat-loss'],
    badge: '',
    tags: ['GLP-1', 'Metabolic Research', 'Receptor Signaling', '10mg Vial'],
    shortDesc: 'Freeze-dried peptide reference material for controlled GLP-1 receptor and metabolic-signaling research.',
    description: 'Semaglutide is a GLP-1 receptor agonist studied in controlled laboratory settings for receptor signaling and metabolic pathway research. This listing is the 10mg lyophilized vial format.',
    benefits: ['GLP-1 receptor research', 'Metabolic signaling research', '10mg vial format', 'Lyophilized laboratory material'],
    sideEffects: ['Research use only — effects and safety depend on study design', 'Not intended for human or veterinary use'],
    dosing: {
      beginner: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'No human-use dosing guidance provided.' },
      intermediate: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Use only within an appropriate laboratory research protocol.' },
      advanced: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Follow laboratory study design and handling requirements.' }
    },
    amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₁₈₇H₂₉₁N₄₅O₅₉', halfLife: 'Research context dependent',
    reconstitution: 'Follow the supplied laboratory handling instructions for the specific research protocol.',
    syringe: 'Laboratory research handling only', injectionSite: 'Not for human or veterinary use',
    storage: 'Store according to supplied product handling instructions.', administration: 'Laboratory research use only',
    warnings: 'For laboratory research use only. Not for human consumption, medical, veterinary, or diagnostic use.',
    suggestedCompanions: ['tirzepatide', 'retatrutide-10'],
    pricing: [ { label: '1 Vial', price: 75 }, { label: '5 Vials', price: 307.5 }, { label: '10 Vials', price: 525 } ]
  },
  {
    id: 'tirzepatide',
    name: 'Tirzepatide — 10mg',
    aka: 'Dual GIP/GLP-1 Agonist',
    category: 'freeze-dried',
    protocols: ['fat-loss'],
    badge: 'Best Seller',
    tags: ['GIP', 'GLP-1', 'Metabolic Research', '10mg Vial'],
    shortDesc: 'Freeze-dried peptide reference material for controlled GIP/GLP-1 receptor-signaling research.',
    description: 'Tirzepatide is a dual GIP and GLP-1 receptor agonist studied in controlled laboratory settings for receptor signaling and metabolic pathway research. This listing is the 10mg lyophilized vial format.',
    benefits: ['Dual GIP/GLP-1 receptor research', 'Metabolic signaling research', '10mg vial format', 'Lyophilized laboratory material'],
    sideEffects: ['Research use only — effects and safety depend on study design', 'Not intended for human or veterinary use'],
    dosing: {
      beginner: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'No human-use dosing guidance provided.' },
      intermediate: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Use only within an appropriate laboratory research protocol.' },
      advanced: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Follow laboratory study design and handling requirements.' }
    },
    amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₂₂₅H₃₄₈N₄₈O₆₈', halfLife: 'Research context dependent',
    reconstitution: 'Follow the supplied laboratory handling instructions for the specific research protocol.',
    syringe: 'Laboratory research handling only', injectionSite: 'Not for human or veterinary use',
    storage: 'Store according to supplied product handling instructions.', administration: 'Laboratory research use only',
    warnings: 'For laboratory research use only. Not for human consumption, medical, veterinary, or diagnostic use.',
    suggestedCompanions: ['semaglutide', 'retatrutide-10'],
    pricing: [ { label: '1 Vial', price: 90 }, { label: '5 Vials', price: 369 }, { label: '10 Vials', price: 630 } ]
  },
  {
    id: 'selank',
    name: 'Selank — 11mg',
    aka: 'Tuftsin Analog Research Peptide',
    category: 'freeze-dried',
    protocols: ['recovery-longevity'],
    badge: '',
    tags: ['Peptide Research', 'Tuftsin Analog', 'Signaling Research', '11mg Vial'],
    shortDesc: 'Lyophilized peptide reference material for controlled tuftsin-analog and signaling research.',
    description: 'Selank is a synthetic tuftsin analog used in controlled laboratory research involving peptide signaling and related pathways. This listing is the 11mg lyophilized vial format.',
    benefits: ['Tuftsin-analog research', 'Peptide-signaling research', '11mg vial format', 'Lyophilized laboratory material'],
    sideEffects: ['Research use only — effects and safety depend on study design', 'Not intended for human or veterinary use'],
    dosing: {
      beginner: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'No human-use dosing guidance provided.' },
      intermediate: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Use only within an appropriate laboratory research protocol.' },
      advanced: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Follow laboratory study design and handling requirements.' }
    },
    amount: '11mg per vial', form: 'Lyophilized Powder', appearance: 'White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₃₈H₅₇N₁₁O₁₀', halfLife: 'Research context dependent',
    reconstitution: 'Follow the supplied laboratory handling instructions for the specific research protocol.',
    syringe: 'Laboratory research handling only', injectionSite: 'Not for human or veterinary use',
    storage: 'Store according to supplied product handling instructions.', administration: 'Laboratory research use only',
    warnings: 'For laboratory research use only. Not for human consumption, medical, veterinary, or diagnostic use.',
    suggestedCompanions: ['semax', 'dsip'],
    pricing: [ { label: '1 Vial', price: 49.99 }, { label: '5 Vials', price: 204.96 }, { label: '10 Vials', price: 349.93 } ]
  },
  {
    id: 'semax',
    name: 'Semax — 11mg',
    aka: 'ACTH Fragment Analog Research Peptide',
    category: 'freeze-dried',
    protocols: ['recovery-longevity'],
    badge: '',
    tags: ['Peptide Research', 'ACTH Analog', 'Signaling Research', '11mg Vial'],
    shortDesc: 'Lyophilized peptide reference material for controlled ACTH-fragment analog and signaling research.',
    description: 'Semax is a synthetic ACTH-fragment analog used in controlled laboratory research involving peptide signaling and related pathways. This listing is the 11mg lyophilized vial format.',
    benefits: ['ACTH-fragment analog research', 'Peptide-signaling research', '11mg vial format', 'Lyophilized laboratory material'],
    sideEffects: ['Research use only — effects and safety depend on study design', 'Not intended for human or veterinary use'],
    dosing: {
      beginner: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'No human-use dosing guidance provided.' },
      intermediate: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Use only within an appropriate laboratory research protocol.' },
      advanced: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Follow laboratory study design and handling requirements.' }
    },
    amount: '11mg per vial', form: 'Lyophilized Powder', appearance: 'White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₃₉H₅₃N₉O₁₀S', halfLife: 'Research context dependent',
    reconstitution: 'Follow the supplied laboratory handling instructions for the specific research protocol.',
    syringe: 'Laboratory research handling only', injectionSite: 'Not for human or veterinary use',
    storage: 'Store according to supplied product handling instructions.', administration: 'Laboratory research use only',
    warnings: 'For laboratory research use only. Not for human consumption, medical, veterinary, or diagnostic use.',
    suggestedCompanions: ['selank', 'dsip'],
    pricing: [ { label: '1 Vial', price: 76.50 }, { label: '5 Vials', price: 313.65 }, { label: '10 Vials', price: 535.50 } ]
  },
  {
    id: 'dsip',
    name: 'DSIP — 10mg',
    aka: 'Delta Sleep-Inducing Peptide',
    category: 'freeze-dried',
    protocols: ['recovery-longevity'],
    badge: '',
    tags: ['Peptide Research', 'DSIP', 'Signaling Research', '10mg Vial'],
    shortDesc: 'Lyophilized DSIP reference material for controlled peptide-signaling laboratory research.',
    description: 'DSIP is a peptide reference material used in controlled laboratory research involving peptide signaling and related pathways. This listing is the 10mg lyophilized vial format.',
    benefits: ['DSIP pathway research', 'Peptide-signaling research', '10mg vial format', 'Lyophilized laboratory material'],
    sideEffects: ['Research use only — effects and safety depend on study design', 'Not intended for human or veterinary use'],
    dosing: {
      beginner: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'No human-use dosing guidance provided.' },
      intermediate: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Use only within an appropriate laboratory research protocol.' },
      advanced: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Follow laboratory study design and handling requirements.' }
    },
    amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₃₅H₄₈N₁₀O₁₅', halfLife: 'Research context dependent',
    reconstitution: 'Follow the supplied laboratory handling instructions for the specific research protocol.',
    syringe: 'Laboratory research handling only', injectionSite: 'Not for human or veterinary use',
    storage: 'Store according to supplied product handling instructions.', administration: 'Laboratory research use only',
    warnings: 'For laboratory research use only. Not for human consumption, medical, veterinary, or diagnostic use.',
    suggestedCompanions: ['selank', 'semax'],
    pricing: [ { label: '1 Vial', price: 49 }, { label: '5 Vials', price: 200.90 }, { label: '10 Vials', price: 343 } ]
  },
  {
    id: 'aod-9604',
    name: 'AOD-9604 — 10mg',
    aka: 'HGH Fragment 176-191 Analog',
    category: 'freeze-dried',
    protocols: ['fat-loss'],
    badge: '',
    tags: ['HGH Fragment', 'Lipid Research', 'Metabolic Research', '10mg Vial'],
    shortDesc: 'Freeze-dried peptide fragment reference material for controlled lipid-metabolism pathway research.',
    description: 'AOD-9604 is a modified HGH-fragment analog studied in controlled laboratory settings for peptide signaling and lipid-metabolism pathways. This listing is the 10mg lyophilized vial format.',
    benefits: ['HGH-fragment research', 'Lipid-metabolism pathway research', '10mg vial format', 'Lyophilized laboratory material'],
    sideEffects: ['Research use only — effects and safety depend on study design', 'Not intended for human or veterinary use'],
    dosing: {
      beginner: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'No human-use dosing guidance provided.' },
      intermediate: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Use only within an appropriate laboratory research protocol.' },
      advanced: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Follow laboratory study design and handling requirements.' }
    },
    amount: '10mg per vial', form: 'Lyophilized Powder', appearance: 'White / Off-White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₇₈H₁₂₅N₂₃O₂₃S₂', halfLife: 'Research context dependent',
    reconstitution: 'Follow the supplied laboratory handling instructions for the specific research protocol.',
    syringe: 'Laboratory research handling only', injectionSite: 'Not for human or veterinary use',
    storage: 'Store according to supplied product handling instructions.', administration: 'Laboratory research use only',
    warnings: 'For laboratory research use only. Not for human consumption, medical, veterinary, or diagnostic use.',
    suggestedCompanions: ['tesamorelin-10', 'mots-c'],
    pricing: [ { label: '1 Vial', price: 73 }, { label: '5 Vials', price: 299.30 }, { label: '10 Vials', price: 511 } ]
  },
  {
    id: 'igf1-lr3',
    name: 'IGF-1 LR3 — 1mg',
    aka: 'Insulin-like Growth Factor Analog',
    category: 'freeze-dried',
    protocols: ['energy-vitality'],
    badge: '',
    tags: ['Growth Factor Research', 'IGF-1', 'Cell Signaling', '1mg Vial'],
    shortDesc: 'Freeze-dried IGF-1 LR3 reference material for controlled growth-factor and cell-signaling research.',
    description: 'IGF-1 LR3 is an IGF-1 analog used in controlled laboratory research involving growth-factor and cell-signaling pathways. This listing is the 1mg lyophilized vial format.',
    benefits: ['IGF-1 pathway research', 'Growth-factor signaling research', '1mg vial format', 'Lyophilized laboratory material'],
    sideEffects: ['Research use only — effects and safety depend on study design', 'Not intended for human or veterinary use'],
    dosing: {
      beginner: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'No human-use dosing guidance provided.' },
      intermediate: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Use only within an appropriate laboratory research protocol.' },
      advanced: { dose: 'Research protocol dependent', frequency: 'Research protocol dependent', duration: 'Research protocol dependent', notes: 'Follow laboratory study design and handling requirements.' }
    },
    amount: '1mg per vial', form: 'Lyophilized Powder', appearance: 'White Powder',
    purity: '>99% (HPLC Verified)', molecularFormula: 'C₄₀₀H₆₂₅N₁₁₁O₁₁₅S₉', halfLife: 'Research context dependent',
    reconstitution: 'Follow the supplied laboratory handling instructions for the specific research protocol.',
    syringe: 'Laboratory research handling only', injectionSite: 'Not for human or veterinary use',
    storage: 'Store according to supplied product handling instructions.', administration: 'Laboratory research use only',
    warnings: 'For laboratory research use only. Not for human consumption, medical, veterinary, or diagnostic use.',
    suggestedCompanions: ['mots-c', 'nad-500'],
    pricing: [ { label: '1 Vial', price: 65 }, { label: '10 Vials', price: 270 } ]
  },

  // ═══════════════════════════════════════
  // CAPSULES / ORAL
  // ═══════════════════════════════════════
  {
    id: 'mk677',
    name: 'MK-677',
    aka: 'Ibutamoren',
    category: 'capsules',
    protocols: ['energy-vitality'],
    badge: '',
    tags: ['Growth Hormone', 'Oral', 'Ghrelin Mimetic', 'IGF-1', 'Sleep'],
    shortDesc: 'Oral ghrelin mimetic that stimulates GH and IGF-1 without injections.',
    description: 'MK-677 (Ibutamoren) is an oral ghrelin mimetic. Research shows sustained GH/IGF-1 elevation, increased lean mass, and improved sleep over 12 months with good tolerability.',
    benefits: ['Oral — no injections', 'Sustained GH and IGF-1 elevation', 'Improved sleep quality', 'Increased lean mass', 'Long-acting (24-hour)'],
    sideEffects: ['Increased appetite', 'Water retention', 'Drowsiness', 'Numbness/tingling', 'Elevated blood glucose'],
    dosing: {
      beginner: { dose: '10 mg', frequency: '1x daily before bed', duration: '8-12 weeks', notes: 'Take before bed to minimize appetite' },
      intermediate: { dose: '15-20 mg', frequency: '1x daily', duration: '12-16 weeks', notes: 'Monitor blood glucose' },
      advanced: { dose: '25 mg', frequency: '1x daily', duration: '16-24 weeks', notes: 'Monitor metabolic markers' }
    },
    amount: '30/100 tablets', form: 'Oral Tablets', appearance: 'Tablet',
    purity: '>99% (HPLC Verified)', molecularFormula: '', halfLife: '~24 hours',
    reconstitution: 'N/A — Oral.', syringe: 'N/A', injectionSite: 'N/A — Oral',
    storage: 'Cool, dry place away from light.', administration: 'Oral',
    warnings: 'May elevate blood glucose. Can cause significant appetite increase. Consult a physician.',
    suggestedCompanions: ['mots-c', 'nad-500', 'ghk-cu-100'],
    pricing: [ { label: '30 Tablets', price: 60 }, { label: '100 Tablets', price: 135 } ]
  },
  {
    id: 'rad140',
    name: 'RAD-140',
    aka: 'Testolone (SARM)',
    category: 'capsules',
    protocols: ['energy-vitality'],
    badge: '',
    tags: ['SARM', 'Anabolic', 'Muscle', 'Androgen Receptor', 'Oral'],
    shortDesc: 'Selective androgen receptor modulator with potent anabolic properties.',
    description: 'RAD-140 (Testolone) is an orally bioavailable SARM with potent anabolic properties. Selective for muscle and bone tissue.',
    benefits: ['Selective androgen receptor activity', 'Lean muscle mass increases', 'Tissue-selective', 'Oral — no injections', 'Potential neuroprotective effects'],
    sideEffects: ['Testosterone suppression', 'Headache', 'Nausea', 'Hair shedding (rare)', 'Liver enzyme elevation'],
    dosing: {
      beginner: { dose: '5-10 mg', frequency: '1x daily', duration: '6-8 weeks', notes: 'PCT may be needed' },
      intermediate: { dose: '10-15 mg', frequency: '1x daily', duration: '8 weeks', notes: 'Blood work recommended' },
      advanced: { dose: '15-20 mg', frequency: '1x daily', duration: '8-10 weeks', notes: 'PCT required. Monitor hormones.' }
    },
    amount: '30/100 tablets', form: 'Oral Tablets', appearance: 'Tablet',
    purity: '>99% (HPLC Verified)', molecularFormula: '', halfLife: '~60 hours',
    reconstitution: 'N/A — Oral.', syringe: 'N/A', injectionSite: 'N/A',
    storage: 'Cool, dry place away from light.', administration: 'Oral',
    warnings: 'WILL suppress testosterone. PCT required. Blood work essential.',
    suggestedCompanions: ['mk677', 'anastrozole', 'hcg-5000'],
    pricing: [ { label: '30 Tablets', price: 65 }, { label: '100 Tablets', price: 120 } ]
  },
  {
    id: 'bpc157-tabs',
    name: 'BPC-157 Tabs',
    aka: 'Body Protection Compound (Oral)',
    category: 'capsules',
    protocols: ['recovery-longevity'],
    badge: '',
    tags: ['Healing', 'Oral', 'Gut Health', 'Anti-Inflammatory', 'Convenient'],
    shortDesc: 'Oral BPC-157 for gut health and systemic tissue repair — no injections.',
    description: 'Oral BPC-157 provides an injection-free option. Particularly effective for GI tract research given its gastric origin.',
    benefits: ['No injection required', 'Effective for GI tract', 'Tissue repair and angiogenesis', 'Convenient tablet form', 'Fibroblast activation'],
    sideEffects: ['Mild nausea', 'GI discomfort', 'Headache', 'Dizziness'],
    dosing: {
      beginner: { dose: '1 tablet', frequency: '1x daily on empty stomach', duration: '4 weeks', notes: '30 min before food' },
      intermediate: { dose: '1 tablet', frequency: '2x daily', duration: '6-8 weeks', notes: 'AM and PM empty stomach' },
      advanced: { dose: '2 tablets', frequency: '2x daily', duration: '8-12 weeks', notes: 'Higher dose for systemic effects' }
    },
    amount: '30/100 tablets', form: 'Oral Tablets', appearance: 'Tablet',
    purity: '>99% (HPLC Verified)', molecularFormula: '', halfLife: '~4 hours',
    reconstitution: 'N/A — Oral.', syringe: 'N/A', injectionSite: 'N/A',
    storage: 'Cool, dry place away from light.', administration: 'Oral',
    warnings: 'Take on empty stomach. Research peptide. Consult a physician.',
    suggestedCompanions: ['bpc157-10', 'tb500-10', 'ghk-cu-100'],
    pricing: [ { label: '30 Tablets', price: 65 }, { label: '100 Tablets', price: 120 } ]
  },
  {
    id: 'anastrozole',
    name: 'Anastrozole — 1mg',
    aka: 'Aromatase Inhibitor',
    category: 'capsules',
    protocols: [],
    badge: '',
    tags: ['AI', 'Estrogen Control', 'Aromatase', 'PCT', 'Endocrine'],
    shortDesc: 'Selective aromatase inhibitor for estrogen management and PCT support.',
    description: 'Anastrozole is a selective aromatase inhibitor used to manage estrogen levels in hormonal research and PCT protocols.',
    benefits: ['Potent aromatase inhibition', 'Reduces estrogen biosynthesis', 'Supports PCT protocols', 'Hormonal balance management', 'Well-characterized profile'],
    sideEffects: ['Joint pain/stiffness', 'Hot flashes', 'Bone density concerns', 'Fatigue', 'Mood changes'],
    dosing: {
      beginner: { dose: '0.25 mg', frequency: '2x per week', duration: 'As needed', notes: 'Lowest effective dose. Do not crash estrogen.' },
      intermediate: { dose: '0.5 mg', frequency: '2-3x per week', duration: 'As needed', notes: 'Titrate based on blood work' },
      advanced: { dose: '1 mg', frequency: '2-3x per week', duration: 'As needed', notes: 'Only with confirmed high E2' }
    },
    amount: '30/100 tablets', form: 'Oral Tablets', appearance: 'Tablet',
    purity: '>99% (HPLC Verified)', molecularFormula: '', halfLife: '~40-50 hours',
    reconstitution: 'N/A — Oral.', syringe: 'N/A', injectionSite: 'N/A',
    storage: 'Cool, dry place away from light.', administration: 'Oral',
    warnings: 'Over-suppression of estrogen is dangerous. ALWAYS use blood work. Estrogen is essential.',
    suggestedCompanions: ['hcg-5000', 'test-e', 'rad140'],
    pricing: [ { label: '30 Tablets', price: 65 }, { label: '100 Tablets', price: 115 } ]
  },
  {
    id: 'slu332',
    name: 'SLU-pp-332',
    aka: 'Exercise Mimetic',
    category: 'capsules',
    protocols: ['energy-vitality'],
    badge: 'Best Seller',
    tags: ['PPAR-delta', 'Exercise Mimetic', 'Endurance', 'Metabolic', 'Mitochondria'],
    shortDesc: 'PPAR-delta activator studied for exercise-mimetic and endurance effects.',
    description: 'SLU-PP-332 targets PPAR-delta activation. Preclinical data shows potential for mitochondrial function, fat oxidation, and endurance — "exercise in a pill."',
    benefits: ['PPAR-delta activation', 'Exercise-mimetic effects', 'Mitochondrial function', 'Fat oxidation', 'Endurance enhancement'],
    sideEffects: ['Mild GI discomfort', 'Headache', 'Limited human data', 'Possible muscle soreness'],
    dosing: {
      beginner: { dose: '1 tablet', frequency: '1x daily', duration: '4 weeks', notes: 'Assess tolerance' },
      intermediate: { dose: '2 tablets', frequency: '1x daily AM', duration: '6-8 weeks', notes: 'Take with food' },
      advanced: { dose: '3 tablets', frequency: '1x daily', duration: '8-12 weeks', notes: 'Cycle 8 on / 4 off' }
    },
    amount: '30/100 tablets', form: 'Oral Tablets', appearance: 'Tablet',
    purity: '>99% (HPLC Verified)', molecularFormula: '', halfLife: 'TBD',
    reconstitution: 'N/A — Oral.', syringe: 'N/A', injectionSite: 'N/A',
    storage: 'Cool, dry place away from light.', administration: 'Oral',
    warnings: 'Novel compound with limited human data. Start low. Consult a physician.',
    suggestedCompanions: ['mk677', 'rad140', 'mots-c'],
    pricing: [ { label: '30 Tablets', price: 112.99 }, { label: '60 Tablets', price: 205.99 }, { label: '100 Tablets', price: 332.99 } ]
  },
  {
    id: 'anavar-25',
    name: 'Anavar — 25mg',
    aka: 'Oxandrolone',
    category: 'capsules',
    protocols: ['energy-vitality'],
    badge: '',
    tags: ['Anabolic', 'Oral', 'Lean Mass', 'Strength', 'Mild'],
    shortDesc: 'Mild oral anabolic studied for lean mass, strength, and recovery.',
    description: 'Anavar (Oxandrolone) is one of the mildest oral anabolics. Studied for lean muscle gains, strength increases, and fat loss with a favorable side effect profile.',
    benefits: ['Mild anabolic profile', 'Lean muscle and strength gains', 'Fat loss support', 'Low androgenic activity', 'Well-tolerated by most'],
    sideEffects: ['Testosterone suppression', 'Lipid changes (HDL/LDL)', 'Mild liver stress', 'Headache', 'Acne (rare)'],
    dosing: {
      beginner: { dose: '25 mg', frequency: '1x daily', duration: '6-8 weeks', notes: 'Split dose AM/PM optional' },
      intermediate: { dose: '50 mg', frequency: '1x daily (or split)', duration: '6-8 weeks', notes: 'Monitor liver enzymes' },
      advanced: { dose: '50-75 mg', frequency: '1x daily (split recommended)', duration: '8 weeks max', notes: 'PCT required. Monitor lipids and liver.' }
    },
    amount: '25mg — 30/100 pc', form: 'Oral Tablets', appearance: 'Tablet',
    purity: '>99%', molecularFormula: '', halfLife: '~9-10 hours',
    reconstitution: 'N/A — Oral.', syringe: 'N/A', injectionSite: 'N/A',
    storage: 'Cool, dry place.', administration: 'Oral',
    warnings: 'Anabolic steroid. Will suppress testosterone. PCT needed. Monitor liver and lipids.',
    suggestedCompanions: ['anastrozole', 'hcg-5000', 'test-e'],
    pricing: [ { label: '30 Tablets', price: 65 }, { label: '100 Tablets', price: 175 } ]
  },
  {
    id: 'anavar-50',
    name: 'Anavar — 50mg',
    aka: 'Oxandrolone',
    category: 'capsules',
    protocols: ['energy-vitality'],
    badge: '',
    tags: ['Anabolic', 'Oral', 'Lean Mass', 'Strength', 'Higher Dose'],
    shortDesc: 'Higher-dose Anavar for experienced users targeting lean mass and strength.',
    description: 'Same Oxandrolone compound in 50mg tablets for experienced users. More convenient dosing for higher-dose protocols.',
    benefits: ['Same mild anabolic profile', 'Convenient higher-dose tablet', 'Lean mass and strength', 'Fat loss support', 'Fewer tablets per day'],
    sideEffects: ['Testosterone suppression', 'Lipid changes', 'Liver stress', 'Headache', 'Acne'],
    dosing: {
      beginner: { dose: '25 mg (half tablet)', frequency: '1x daily', duration: '6-8 weeks', notes: 'Can split tablet' },
      intermediate: { dose: '50 mg (1 tablet)', frequency: '1x daily', duration: '6-8 weeks', notes: 'Monitor liver' },
      advanced: { dose: '50-100 mg', frequency: '1x daily (split)', duration: '8 weeks max', notes: 'PCT required' }
    },
    amount: '50mg — 30/100 pc', form: 'Oral Tablets', appearance: 'Tablet',
    purity: '>99%', molecularFormula: '', halfLife: '~9-10 hours',
    reconstitution: 'N/A — Oral.', syringe: 'N/A', injectionSite: 'N/A',
    storage: 'Cool, dry place.', administration: 'Oral',
    warnings: 'Anabolic steroid. PCT required. Monitor liver and lipids. Consult a physician.',
    suggestedCompanions: ['anastrozole', 'hcg-5000', 'test-e'],
    pricing: [ { label: '30 Tablets', price: 85 }, { label: '100 Tablets', price: 250 } ]
  },
  {
    id: 'winstrol',
    name: 'Winstrol — 50mg',
    aka: 'Stanozolol',
    category: 'capsules',
    protocols: ['energy-vitality'],
    badge: '',
    tags: ['Anabolic', 'Oral', 'Cutting', 'Hardening', 'Strength'],
    shortDesc: 'Oral anabolic studied for lean/hard physique, vascularity, and strength.',
    description: 'Winstrol (Stanozolol) is an oral anabolic known for producing a lean, hard, and vascular appearance. Popular in cutting and contest prep research.',
    benefits: ['Lean/hard physique', 'Increased vascularity', 'Strength gains without water', 'Fat loss support', 'No estrogen conversion'],
    sideEffects: ['Joint dryness/pain', 'Testosterone suppression', 'Liver stress', 'Lipid changes', 'Hair loss (DHT-derived)'],
    dosing: {
      beginner: { dose: '25 mg', frequency: '1x daily', duration: '6 weeks', notes: 'Monitor joints — can cause dryness' },
      intermediate: { dose: '50 mg', frequency: '1x daily', duration: '6-8 weeks', notes: 'Joint support supplements recommended' },
      advanced: { dose: '50-75 mg', frequency: '1x daily', duration: '6-8 weeks max', notes: 'Not for extended use. PCT required.' }
    },
    amount: '50mg — 30/100 pc', form: 'Oral Tablets', appearance: 'Tablet',
    purity: '>99%', molecularFormula: '', halfLife: '~9 hours',
    reconstitution: 'N/A — Oral.', syringe: 'N/A', injectionSite: 'N/A',
    storage: 'Cool, dry place.', administration: 'Oral',
    warnings: 'Harsh on joints and liver. Short cycles only. PCT required. Monitor lipids and liver.',
    suggestedCompanions: ['anastrozole', 'test-e', 'hcg-5000'],
    pricing: [ { label: '30 Tablets', price: 85 }, { label: '100 Tablets', price: 250 } ]
  },

  // ═══════════════════════════════════════
  // INJECTABLES
  // ═══════════════════════════════════════
  {
    id: 'test-e',
    name: 'Test E — 250mg',
    aka: 'Testosterone Enanthate',
    category: 'injectables',
    protocols: ['energy-vitality'],
    badge: '',
    tags: ['Testosterone', 'Anabolic', 'Hormone', 'Muscle', 'TRT'],
    shortDesc: 'Long-acting testosterone ester — the gold standard for TRT and anabolic research.',
    description: 'Testosterone Enanthate is the most widely used testosterone ester. Long-acting with a half-life of ~4.5 days, allowing for weekly or bi-weekly injection protocols.',
    benefits: ['Gold standard testosterone ester', 'Increases muscle mass and strength', 'Supports recovery and libido', 'Long-acting (weekly dosing)', 'Well-established safety profile'],
    sideEffects: ['Estrogen conversion', 'Acne', 'Water retention', 'Hair loss (genetic)', 'Mood changes', 'Testicular atrophy'],
    dosing: {
      beginner: { dose: '150-200 mg', frequency: '1x per week', duration: '12-16 weeks', notes: 'TRT range. Monitor blood work.' },
      intermediate: { dose: '300-500 mg', frequency: '1x per week (or split 2x)', duration: '12-16 weeks', notes: 'AI on hand. Regular blood work.' },
      advanced: { dose: '500-750 mg', frequency: '2x per week (split)', duration: '12-16 weeks', notes: 'AI + HCG support. Full PCT after.' }
    },
    amount: '250mg/mL', form: 'Injectable Oil', appearance: 'Clear/Yellow Oil',
    purity: '>99%', molecularFormula: 'C₂₆H₄₀O₃', halfLife: '~4.5 days',
    reconstitution: 'Ready to inject — no reconstitution needed.',
    syringe: '25-27 gauge, 1-3 mL syringe', injectionSite: 'IM injection in glute, deltoid, or quad. Rotate sites.',
    storage: 'Room temperature. Protect from light.', administration: 'IM',
    warnings: 'Anabolic steroid. Aromatizes to estrogen — AI may be needed. PCT required after cycle. Regular blood work mandatory.',
    suggestedCompanions: ['mots-c', 'nad-500', 'ghk-cu-100'],
    pricing: [ { label: '1 Vial', price: 85 }, { label: '2 Vials', price: 165 }, { label: '3 Vials', price: 240 }, { label: '4 Vials', price: 310 }, { label: '5 Vials', price: 375 } ]
  },
  {
    id: 'test-c',
    name: 'Test C — 250mg',
    aka: 'Testosterone Cypionate',
    category: 'injectables',
    protocols: ['energy-vitality'],
    badge: '',
    tags: ['Testosterone', 'Anabolic', 'Hormone', 'TRT', 'Long-Acting'],
    shortDesc: 'Long-acting testosterone ester — virtually identical to Test E with slightly longer half-life.',
    description: 'Testosterone Cypionate is functionally identical to Enanthate with a slightly longer ester chain. Preferred in US-based TRT protocols.',
    benefits: ['Nearly identical to Test E', 'Preferred in US TRT', 'Slightly longer half-life', 'Muscle mass and strength', 'Weekly or bi-weekly dosing'],
    sideEffects: ['Estrogen conversion', 'Acne', 'Water retention', 'Hair loss', 'Mood changes', 'Testicular atrophy'],
    dosing: {
      beginner: { dose: '150-200 mg', frequency: '1x per week', duration: '12-16 weeks', notes: 'TRT range' },
      intermediate: { dose: '300-500 mg', frequency: '1-2x per week', duration: '12-16 weeks', notes: 'AI on hand' },
      advanced: { dose: '500-750 mg', frequency: '2x per week', duration: '12-16 weeks', notes: 'Full PCT after. HCG support.' }
    },
    amount: '250mg/mL', form: 'Injectable Oil', appearance: 'Clear/Yellow Oil',
    purity: '>99%', molecularFormula: 'C₂₇H₄₀O₃', halfLife: '~5 days',
    reconstitution: 'Ready to inject.',
    syringe: '25-27 gauge, 1-3 mL', injectionSite: 'IM in glute, deltoid, or quad.',
    storage: 'Room temperature. Protect from light.', administration: 'IM',
    warnings: 'Same as Test E. Aromatizes. PCT required. Blood work mandatory.',
    suggestedCompanions: ['mots-c', 'nad-500', 'ghk-cu-100'],
    pricing: [ { label: '1 Vial', price: 85 }, { label: '2 Vials', price: 165 }, { label: '3 Vials', price: 240 }, { label: '4 Vials', price: 310 }, { label: '5 Vials', price: 375 } ]
  },
  {
    id: 'equipoise',
    name: 'Equipoise — 300mg',
    aka: 'Boldenone Undecylenate',
    category: 'injectables',
    protocols: ['energy-vitality'],
    badge: '',
    tags: ['Anabolic', 'Lean Mass', 'Endurance', 'Vascularity', 'Appetite'],
    shortDesc: 'Anabolic studied for lean mass, vascularity, and red blood cell production.',
    description: 'Equipoise (Boldenone Undecylenate) is an anabolic known for quality lean mass gains, increased vascularity, and enhanced red blood cell production. Long-acting ester.',
    benefits: ['Quality lean mass gains', 'Increased vascularity', 'Enhanced RBC production', 'Improved endurance', 'Moderate appetite increase'],
    sideEffects: ['Increased RBC (monitor hematocrit)', 'Anxiety (some users)', 'Acne', 'Hair loss', 'Mild suppression'],
    dosing: {
      beginner: { dose: '300 mg', frequency: '1x per week', duration: '14-16 weeks', notes: 'Long ester — needs longer cycles' },
      intermediate: { dose: '400-600 mg', frequency: '1x per week', duration: '16 weeks', notes: 'Monitor hematocrit' },
      advanced: { dose: '600-800 mg', frequency: '1-2x per week', duration: '16-20 weeks', notes: 'Donate blood if hematocrit rises' }
    },
    amount: '300mg/mL', form: 'Injectable Oil', appearance: 'Yellow Oil',
    purity: '>99%', molecularFormula: 'C₃₀H₄₄O₃', halfLife: '~14 days',
    reconstitution: 'Ready to inject.',
    syringe: '25-27 gauge', injectionSite: 'IM in glute or quad.',
    storage: 'Room temperature.', administration: 'IM',
    warnings: 'Monitor hematocrit and RBC levels. Long detection time. PCT needed.',
    suggestedCompanions: ['test-e', 'anastrozole', 'hcg-5000'],
    pricing: [ { label: '1 Vial', price: 90 }, { label: '2 Vials', price: 175 }, { label: '3 Vials', price: 255 }, { label: '4 Vials', price: 330 }, { label: '5 Vials', price: 395 } ]
  },
  {
    id: 'deca',
    name: 'Deca — 300mg',
    aka: 'Nandrolone Decanoate',
    category: 'injectables',
    protocols: ['energy-vitality', 'recovery-longevity'],
    badge: '',
    tags: ['Anabolic', 'Joint Health', 'Mass', 'Recovery', 'Collagen'],
    shortDesc: 'Anabolic known for joint relief, mass gains, and collagen synthesis.',
    description: 'Deca (Nandrolone Decanoate) is prized for joint relief and collagen synthesis alongside quality mass gains. One of the best-tolerated anabolics for joint health.',
    benefits: ['Joint pain relief', 'Collagen synthesis', 'Quality mass gains', 'Enhanced recovery', 'Well-tolerated'],
    sideEffects: ['Progesterone-related sides', 'Testosterone suppression', 'Water retention', '"Deca dick" (libido issues)', 'Slow clearance'],
    dosing: {
      beginner: { dose: '200-300 mg', frequency: '1x per week', duration: '12-16 weeks', notes: 'Always run with testosterone base' },
      intermediate: { dose: '300-400 mg', frequency: '1x per week', duration: '14-16 weeks', notes: 'Test should be higher than Deca' },
      advanced: { dose: '400-600 mg', frequency: '1x per week', duration: '16-20 weeks', notes: 'Manage prolactin if needed' }
    },
    amount: '300mg/mL', form: 'Injectable Oil', appearance: 'Yellow Oil',
    purity: '>99%', molecularFormula: 'C₂₈H₄₄O₃', halfLife: '~6-12 days',
    reconstitution: 'Ready to inject.',
    syringe: '25-27 gauge', injectionSite: 'IM in glute or quad.',
    storage: 'Room temperature.', administration: 'IM',
    warnings: 'MUST run with testosterone. Very long detection time. Can cause libido issues. PCT complex.',
    suggestedCompanions: ['test-e', 'anastrozole', 'hcg-5000'],
    pricing: [ { label: '1 Vial', price: 90 }, { label: '2 Vials', price: 175 }, { label: '3 Vials', price: 255 }, { label: '4 Vials', price: 330 }, { label: '5 Vials', price: 395 } ]
  },
  {
    id: 'masteron',
    name: 'Masteron — 200mg',
    aka: 'Drostanolone Enanthate',
    category: 'injectables',
    protocols: ['energy-vitality'],
    badge: '',
    tags: ['Anabolic', 'Cutting', 'Hardening', 'Anti-Estrogenic', 'DHT'],
    shortDesc: 'DHT-derived anabolic for hardening, anti-estrogenic effects, and contest prep.',
    description: 'Masteron (Drostanolone) is a DHT-derived anabolic with anti-estrogenic properties. Produces a hard, dry, and vascular look. Popular for cutting and contest prep.',
    benefits: ['Hard, dry physique', 'Anti-estrogenic properties', 'Increased vascularity', 'Strength without water', 'No aromatization'],
    sideEffects: ['Hair loss (DHT)', 'Acne', 'Prostate enlargement risk', 'Testosterone suppression', 'Aggression'],
    dosing: {
      beginner: { dose: '200-300 mg', frequency: '2-3x per week (split)', duration: '8-12 weeks', notes: 'Short ester — frequent injections' },
      intermediate: { dose: '300-400 mg', frequency: 'EOD or 3x/week', duration: '8-12 weeks', notes: 'Stack with testosterone' },
      advanced: { dose: '400-600 mg', frequency: 'EOD', duration: '8-12 weeks', notes: 'Contest prep compound' }
    },
    amount: '200mg/mL', form: 'Injectable Oil', appearance: 'Clear Oil',
    purity: '>99%', molecularFormula: 'C₂₃H₃₆O₃', halfLife: '~2.5 days (prop)',
    reconstitution: 'Ready to inject.',
    syringe: '25-27 gauge', injectionSite: 'IM in glute, deltoid, or quad.',
    storage: 'Room temperature.', administration: 'IM',
    warnings: 'DHT-derived — hair loss risk. Run with testosterone base. Not for beginners.',
    suggestedCompanions: ['test-e', 'winstrol', 'anavar-50'],
    pricing: [ { label: '1 Vial', price: 140 }, { label: '2 Vials', price: 270 }, { label: '3 Vials', price: 395 }, { label: '4 Vials', price: 510 }, { label: '5 Vials', price: 620 } ]
  },
  {
    id: 'npp',
    name: 'NPP — 200mg',
    aka: 'Nandrolone Phenylpropionate',
    category: 'injectables',
    protocols: ['energy-vitality', 'recovery-longevity'],
    badge: '',
    tags: ['Anabolic', 'Joint Health', 'Fast-Acting', 'Recovery', 'Mass'],
    shortDesc: 'Fast-acting nandrolone with joint relief and mass benefits — clears system faster than Deca.',
    description: 'NPP is the short-ester version of Nandrolone. Same joint relief and mass benefits as Deca but clears the system much faster, allowing quicker recovery and PCT.',
    benefits: ['Same benefits as Deca', 'Faster acting and clearance', 'Joint pain relief', 'Quality mass gains', 'Easier to manage sides'],
    sideEffects: ['Same as Deca but shorter duration', 'Progesterone sides', 'Water retention', 'Libido issues possible', 'Frequent injections needed'],
    dosing: {
      beginner: { dose: '200 mg', frequency: 'EOD or 3x/week', duration: '8-12 weeks', notes: 'Run with testosterone' },
      intermediate: { dose: '300-400 mg', frequency: 'EOD', duration: '10-12 weeks', notes: 'Test higher than NPP' },
      advanced: { dose: '400-600 mg', frequency: 'EOD', duration: '10-14 weeks', notes: 'Manage prolactin' }
    },
    amount: '200mg/mL', form: 'Injectable Oil', appearance: 'Yellow Oil',
    purity: '>99%', molecularFormula: 'C₂₇H₃₄O₃', halfLife: '~2.7 days',
    reconstitution: 'Ready to inject.',
    syringe: '25-27 gauge', injectionSite: 'IM in glute, deltoid, or quad.',
    storage: 'Room temperature.', administration: 'IM',
    warnings: 'Must run with testosterone. More frequent injections than Deca. Monitor prolactin.',
    suggestedCompanions: ['test-e', 'anastrozole', 'hcg-5000'],
    pricing: [ { label: '1 Vial', price: 90 }, { label: '2 Vials', price: 175 }, { label: '3 Vials', price: 255 }, { label: '4 Vials', price: 330 }, { label: '5 Vials', price: 395 } ]
  },
  {
    id: 'tren-ace',
    name: 'Tren Ace — 100mg',
    aka: 'Trenbolone Acetate',
    category: 'injectables',
    protocols: ['energy-vitality'],
    badge: '',
    tags: ['Anabolic', 'Powerful', 'Cutting', 'Recomp', 'Advanced'],
    shortDesc: 'Most potent anabolic available — for advanced researchers only.',
    description: 'Trenbolone Acetate is the most powerful anabolic steroid available. Produces dramatic body composition changes — muscle gain and fat loss simultaneously. For advanced users ONLY.',
    benefits: ['Most potent anabolic', 'Simultaneous muscle gain + fat loss', 'No aromatization', 'Incredible hardening and vascularity', 'Dramatic strength increases'],
    sideEffects: ['Night sweats', 'Insomnia', 'Aggression', 'Tren cough', 'Testosterone suppression', 'Cardiovascular strain', 'Anxiety', 'Hair loss'],
    dosing: {
      beginner: { dose: 'NOT RECOMMENDED', frequency: 'N/A', duration: 'N/A', notes: 'Tren is NOT for beginners. Use other compounds first.' },
      intermediate: { dose: '150-200 mg', frequency: 'EOD', duration: '6-8 weeks', notes: 'Start very low. Run with testosterone.' },
      advanced: { dose: '200-400 mg', frequency: 'EOD', duration: '8-10 weeks max', notes: 'Monitor cardiovascular health. Keep cycles short.' }
    },
    amount: '100mg/mL', form: 'Injectable Oil', appearance: 'Yellow/Amber Oil',
    purity: '>99%', molecularFormula: 'C₂₀H₂₄O₃', halfLife: '~1-2 days',
    reconstitution: 'Ready to inject.',
    syringe: '25-27 gauge', injectionSite: 'IM in glute or quad.',
    storage: 'Room temperature.', administration: 'IM',
    warnings: 'ADVANCED USERS ONLY. Severe side effects possible. Run with testosterone base. Monitor cardiovascular health. Short cycles only. Not for long-term use.',
    suggestedCompanions: ['test-e', 'anastrozole', 'masteron'],
    pricing: [ { label: '1 Vial', price: 105 }, { label: '2 Vials', price: 205 }, { label: '3 Vials', price: 295 }, { label: '4 Vials', price: 385 }, { label: '5 Vials', price: 465 } ]
  }
];

// ══════════════════════════════════════
// CURATED STACKS
// ══════════════════════════════════════
const stacks = [
  {
    id: 'fat-loss-reset', name: 'FAT LOSS RESET', goal: 'Maximum metabolic activation & body composition change', icon: '🔥',
    compounds: [
      { name: 'Retatrutide 10mg', role: 'Tri-agonist metabolic driver', id: 'retatrutide-10' },
      { name: 'Tesamorelin 10mg', role: 'GH axis & visceral fat', id: 'tesamorelin-10' },
      { name: 'AOD-9604 10mg', role: 'HGH fragment for fat oxidation', id: 'aod-9604' }
    ],
    protocol: 'Retatrutide weekly + Tesamorelin daily + AOD fasted AM. Cycle 12-16 weeks.',
    pairsWith: 'Caloric deficit, resistance training, high protein diet', duration: '12-16 weeks'
  },
  {
    id: 'wolverine-recovery', name: 'WOLVERINE RECOVERY', goal: 'Fast-track healing from injury, surgery, or chronic damage', icon: '🦴',
    compounds: [
      { name: 'TB-500 + BPC-157 Blend', role: 'Dual-pathway tissue repair', id: 'tb500-bpc157' },
      { name: 'GHK-Cu 100mg', role: 'Collagen synthesis & inflammation', id: 'ghk-cu-100' },
      { name: 'NAD+ 500mg', role: 'Cellular energy & DNA repair', id: 'nad-500' }
    ],
    protocol: 'BPC/TB-500 daily + GHK-Cu daily + NAD+ 3x/week. Cycle 6-8 weeks.',
    pairsWith: 'Physical therapy, mobility work, adequate sleep', duration: '6-8 weeks'
  },
  {
    id: 'gh-optimization', name: 'GH OPTIMIZATION', goal: 'Maximum growth hormone & IGF-1 for performance', icon: '💪',
    compounds: [
      { name: 'Ipamorelin 10mg', role: 'Clean daily GH pulse', id: 'ipamorelin' },
      { name: 'Sermorelin 10mg', role: 'GHRH baseline stimulation', id: 'sermorelin' },
      { name: 'MK-677 (Oral)', role: 'Sustained oral GH + IGF-1', id: 'mk677' }
    ],
    protocol: 'Ipamorelin 1-2x daily + Sermorelin nightly + MK-677 before bed. 12-16 weeks.',
    pairsWith: 'High-protein diet, training, 8+ hours sleep', duration: '12-16 weeks'
  },
  {
    id: 'skin-glow', name: 'SKIN & BEAUTY', goal: 'Collagen production, skin rejuvenation, UV protection', icon: '✨',
    compounds: [
      { name: 'GHK-Cu 100mg', role: 'Collagen & elastin synthesis', id: 'ghk-cu-100' },
      { name: 'GLOW 70mg', role: '4-peptide recovery blend', id: 'glow-70' },
      { name: 'Melanotan-1 10mg', role: 'Melanin & photoprotection', id: 'mela1-10' }
    ],
    protocol: 'GHK-Cu daily + GLOW daily + MT-1 loading then 2-3x/week.',
    pairsWith: 'SPF 50+ sunscreen, retinol, hydration', duration: '8-12 weeks'
  },
  {
    id: 'brain-stack', name: 'BRAIN STACK', goal: 'Focus, memory, mood & neuroprotection', icon: '🧠',
    compounds: [
      { name: 'Semax 11mg', role: 'BDNF & focus (morning)', id: 'semax' },
      { name: 'Selank 11mg', role: 'Anxiety reduction & mood', id: 'selank' },
      { name: 'DSIP 10mg', role: 'Deep sleep & cortisol control', id: 'dsip' }
    ],
    protocol: 'Semax AM + Selank afternoon + DSIP before bed. 4-8 weeks.',
    pairsWith: "Lion's Mane, omega-3, adequate sleep", duration: '4-8 weeks'
  },
  {
    id: 'anabolic-cycle', name: 'LEAN MASS CYCLE', goal: 'Quality muscle gain with minimal water retention', icon: '⚖️',
    compounds: [
      { name: 'Test E 250mg', role: 'Testosterone base', id: 'test-e' },
      { name: 'Anavar 50mg', role: 'Lean mass & strength', id: 'anavar-50' },
      { name: 'Anastrozole 1mg', role: 'Estrogen management', id: 'anastrozole' }
    ],
    protocol: 'Test E 300-500mg/week + Anavar 50mg/day (last 6-8 weeks) + AI as needed.',
    pairsWith: 'Progressive overload, caloric surplus, regular blood work', duration: '12-16 weeks'
  },
  {
    id: 'mitochondrial-metabolic-panel', name: 'MITOCHONDRIAL & METABOLIC PANEL', goal: 'Compare cellular-energy, mitochondrial, and metabolic signaling pathways', icon: '⚡',
    compounds: [
      { name: 'MOTS-c 10mg', role: 'Mitochondrial signaling / AMPK research', id: 'mots-c' },
      { name: 'NAD+ 500mg', role: 'Cellular redox and energy-cofactor research', id: 'nad-500' },
      { name: 'AOD-9604 10mg', role: 'Lipid-metabolism pathway research', id: 'aod-9604' }
    ],
    protocol: 'Research-theme collection for comparing distinct metabolic pathways in controlled study arms; not a concurrent-use protocol.',
    pairsWith: 'Metabolic biomarkers, body-composition endpoints, and controlled nutrition variables', duration: 'Study-design dependent'
  },
  {
    id: 'repair-remodeling-panel', name: 'TISSUE REPAIR & REMODELING PANEL', goal: 'Compare tissue-repair, collagen-remodeling, and cellular-recovery pathways', icon: '🧬',
    compounds: [
      { name: 'BPC-157 10mg', role: 'Tissue-repair pathway research', id: 'bpc157-10' },
      { name: 'GHK-Cu 100mg', role: 'Collagen and extracellular-matrix research', id: 'ghk-cu-100' },
      { name: 'NAD+ 500mg', role: 'Cellular-energy and recovery research', id: 'nad-500' }
    ],
    protocol: 'Research-theme collection for studying complementary repair pathways in separate or appropriately controlled study arms; not human-use guidance.',
    pairsWith: 'Mechanical-loading models, collagen markers, wound-repair endpoints, and recovery measures', duration: 'Study-design dependent'
  },
  {
    id: 'gh-axis-comparison-panel', name: 'GH-AXIS COMPARISON PANEL', goal: 'Compare different approaches to growth-hormone-axis signaling research', icon: '📈',
    compounds: [
      { name: 'Ipamorelin 10mg', role: 'Ghrelin-receptor / GH secretagogue research', id: 'ipamorelin' },
      { name: 'Sermorelin 10mg', role: 'GHRH-pathway research', id: 'sermorelin' },
      { name: 'Tesamorelin 10mg', role: 'GHRH-analog research', id: 'tesamorelin-10' }
    ],
    protocol: 'Comparison panel for separate research arms examining different GH-axis mechanisms; not a recommendation to combine these compounds.',
    pairsWith: 'IGF-1 measurements, GH-response curves, sleep/recovery endpoints, and metabolic markers', duration: 'Study-design dependent'
  },
  {
    id: 'cellular-recovery-panel', name: 'CELLULAR RECOVERY PANEL', goal: 'Compare mitochondrial, connective-tissue, and cellular-recovery pathways', icon: '🔬',
    compounds: [
      { name: 'MOTS-c 10mg', role: 'Mitochondrial stress-response research', id: 'mots-c' },
      { name: 'GHK-Cu 100mg', role: 'Collagen and tissue-remodeling research', id: 'ghk-cu-100' },
      { name: 'NAD+ 500mg', role: 'Cellular redox / energy research', id: 'nad-500' }
    ],
    protocol: 'Research-theme collection for controlled comparison of recovery-related pathways; not a concurrent-use or dosing protocol.',
    pairsWith: 'Recovery biomarkers, oxidative-stress markers, collagen endpoints, and performance measures', duration: 'Study-design dependent'
  }
];

// Protocol definitions
const protocols = [
  { id: 'fat-loss', name: 'Fat Loss Protocol', icon: '🔥', description: 'Compounds studied for metabolic activation and body composition.' },
  { id: 'energy-vitality', name: 'Energy & Vitality', icon: '⚡', description: 'Compounds for growth hormone, energy, performance, and anabolics.' },
  { id: 'recovery-longevity', name: 'Recovery & Longevity', icon: '🔬', description: 'Compounds for tissue repair, healing, cognition, and anti-aging.' },
  { id: 'skin-beauty', name: 'Skin & Beauty', icon: '✨', description: 'Compounds for skin health, pigmentation, and collagen synthesis.' }
];

// Category definitions
const categories = [
  { id: 'all', name: 'All Compounds' },
  { id: 'freeze-dried', name: 'Peptides (Freeze-Dried)' },
  { id: 'capsules', name: 'Orals & Tablets' },
  { id: 'injectables', name: 'Injectables' }
];

// The direct-payment API imports the same catalog so checkout totals are
// calculated from trusted product data instead of browser-supplied prices.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { compounds, stacks, protocols, categories };
}
