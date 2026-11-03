// Editorial research context. Literature identifies reference compounds, not stock lots.
// Keep quantities and prices in the trusted catalog; never infer assay results from a name.
const paths = require('./catalog-paths.json');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sources = {
 bpc: ['https://pubmed.ncbi.nlm.nih.gov/21030672/','Chang et al. (2011): BPC-157 in tendon explants and fibroblasts'],
 tb: ['https://pubmed.ncbi.nlm.nih.gov/22962027/','Esposito et al. (2012): analytical identification of a TB-500 peptide fragment'],
 ghk: ['https://pubmed.ncbi.nlm.nih.gov/3169264/','Maquart et al. (1988): GHK-Cu in fibroblast cultures'],
 kpv: ['https://pubmed.ncbi.nlm.nih.gov/18061177/','Primary research: KPV transport and cellular signaling'],
 cjc: ['https://pubmed.ncbi.nlm.nih.gov/15817669/','Jetté et al. (2005): CJC-1295 and albumin conjugation'],
 ghrh: ['https://pubmed.ncbi.nlm.nih.gov/37806509/','Primary analytical study (2023): distinguishing GHRH-related peptides by UHPLC-MS/MS'],
 ipa: ['https://pubmed.ncbi.nlm.nih.gov/9849822/','Raun et al. (1998): identification and characterization of ipamorelin'],
 mela1: ['https://pubmed.ncbi.nlm.nih.gov/6657517/','Kobobun et al. (1983): characterization of an alpha-MSH analogue'],
 mela2: ['https://pubmed.ncbi.nlm.nih.gov/19043625/','Ryakhovsky et al. (2008): chemical characterization of melanotan II'],
 pt: ['https://pubmed.ncbi.nlm.nih.gov/12851303/','Molinoff et al. (2003): PT-141 and melanocortin receptors'],
 mots: ['https://pubmed.ncbi.nlm.nih.gov/25738459/','Lee et al. (2015): identification of the mitochondrial-derived peptide MOTS-c'],
 sema: ['https://pubmed.ncbi.nlm.nih.gov/26308095/','Lau et al. (2015): discovery and molecular design of semaglutide'],
 tirz: ['https://pubmed.ncbi.nlm.nih.gov/30473097/','Coskun et al. (2018): characterization of LY3298176 / tirzepatide'],
 reta: ['https://pubmed.ncbi.nlm.nih.gov/39019866/','Li et al. (2024): retatrutide structures at GLP-1, GIP and glucagon receptors'],
 selank: ['https://pubmed.ncbi.nlm.nih.gov/21609736/','Kolomin et al. (2011): Selank and gene-expression measurements in mice'],
 semax: ['https://pubmed.ncbi.nlm.nih.gov/14556513/','Primary research (2003): Semax and BDNF expression in rat brain'],
 dsip: ['https://pubmed.ncbi.nlm.nih.gov/568769/','Schoenenberger et al. (1978): DSIP sequence and chemical characterization'],
 aod: ['https://pubmed.ncbi.nlm.nih.gov/25208511/','Cox et al. (2015): analytical detection of AOD9604'],
 igf: ['https://pubmed.ncbi.nlm.nih.gov/7561636/','Primary research (1995): Long R3 IGF-I and IGF-binding proteins'],
 slu: ['https://pubmed.ncbi.nlm.nih.gov/36988910/','Primary research (2023): SLU-PP-332 and estrogen-related receptors'],
 hcg: ['https://pubmed.ncbi.nlm.nih.gov/7922031/','Primary structural research (1994): human chorionic gonadotropin subunits'],
 nad: ['https://pubchem.ncbi.nlm.nih.gov/compound/10897651','NIH PubChem: NAD+ chemical reference record'],
 gsh: ['https://pubchem.ncbi.nlm.nih.gov/compound/124886','NIH PubChem: reduced glutathione chemical reference record'],
 water: ['https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=87d6e9dc-fe3b-4593-ac9a-d7493d1959c7','DailyMed: an example manufacturer label describing bacteriostatic water']
};

const records = {
 'bpc157-10': {
  topic:'BPC-157', meta:'BPC-157 10mg research vials: compare pack prices, published fibroblast research and material-documentation checks. Laboratory research only.',
  overview:'BPC-157 is a 15-amino-acid peptide examined in preclinical research. Published work includes tendon explants and cultured tendon fibroblasts, with measurements of cell migration and associated signaling. Those experimental systems provide research context; they do not establish the performance of a purchased vial.',
  checks:['Request sequence or identity evidence for BPC-157, together with the salt or counterion and the lot number.','Review the single-material identity separately from the TB-500 + BPC-157 blend; the blend label does not describe 10mg of each component.'],
  question:'How does this differ from the TB-500 + BPC-157 listing?', answer:'This listing states 10mg of BPC-157 per vial. The separate blend listing states 10mg total per vial and requires confirmation of its component amounts. Choosing a larger BPC-157 pack changes the number of individual vials.', sources:['bpc'], related:['tb500-bpc157','tb500-10']
 },
 'tb500-10': {
  topic:'TB-500', meta:'TB-500 10mg research vial prices, published laboratory report and peptide-identity checks. Review fragment naming and quantity options before ordering.',
  overview:'TB-500 naming requires care. An analytical study identified an acetylated fragment corresponding to residues 17–23 of thymosin beta-4 in a product labeled TB-500. A trade label alone therefore should not be used to infer a full-length thymosin beta-4 sequence or a particular fragment.',
  checks:['Confirm the exact peptide sequence and molecular identity on the documentation for the offered lot.','The published TB-500 report concerns a 10mg sample. Ask whether it corresponds to the lot currently offered; the material name alone is not a lot match.'],
  question:'Does “TB-500” establish the exact peptide sequence?', answer:'No. Confirm the sequence and identity evidence for the supplied material. A report or paper describing one TB-500-labeled sample does not establish the molecular form in every other sample.', sources:['tb'], reports:['tb002'], related:['bpc157-10','tb500-bpc157']
 },
 'tb500-bpc157': {
  topic:'TB-500 + BPC-157 blend', meta:'Compare the TB-500 + BPC-157 10mg research blend with separate-vial listings. Check component amounts, identity documentation and pack pricing.',
  overview:'This catalog item is a blend in one vial, labeled 10mg total. The listing names TB-500 and BPC-157 but does not specify the mass of each component. A blend cannot be treated as a single chemically defined peptide or as equivalent to two separately labeled vials.',
  checks:['Request the complete component list, the amount of each component and the exact TB-500 molecular form.','Ask how the analytical report distinguishes and quantifies both components. A report for either separate material does not characterize the blend.'],
  question:'Is the vial 10mg of each component?', answer:'The catalog states 10mg per vial for the blend as a whole. It does not state 10mg of each component. Confirm the individual amounts before procurement; no component ratio is assumed here.', sources:['bpc','tb'], related:['bpc157-10','tb500-10','glow-70']
 },
 'tesamorelin-10': {
  topic:'Tesamorelin', meta:'Tesamorelin 10mg research vial and pack prices, GHRH-related analytical references, and identity checks for the supplied lot. Laboratory research only.',
  overview:'Tesamorelin belongs to the growth hormone-releasing hormone / factor (GHRH / GRF) analogue group. Analytical literature treats tesamorelin, sermorelin and CJC-1295 as distinct analytes. Sharing a research family does not establish equivalent sequence, modification or analytical response.',
  checks:['Request material identity and sequence information specific to tesamorelin, including any terminal modification and counterion.','Match the labeled 10mg vial to its lot documentation; a report for another GHRH-related peptide is not interchangeable.'],
  question:'Is tesamorelin the same material as sermorelin?', answer:'They are separate catalog materials and are distinguished in analytical literature. Compare exact identity and specification, rather than assuming equivalence from their shared GHRH-related classification.', sources:['ghrh'], related:['sermorelin','cjc1295-dac-10']
 },
 sermorelin: {
  topic:'Sermorelin', meta:'Sermorelin 10mg research vials: GRF 1–29 reference information, identity and lot checks, single-vial prices and quantity savings.',
  overview:'Sermorelin is identified in analytical literature as GRF 1–29. Published mass-spectrometry work distinguishes it from related GHRH analogues and truncated fragments. This makes the exact identity and terminal form relevant when matching a laboratory specification to a supplier listing.',
  checks:['Request the sequence and terminal-form specification for the offered sermorelin lot.','Check that the analytical identity refers to the intended GRF 1–29 material, rather than another fragment or a different GHRH analogue.'],
  question:'What does the GRF 1–29 reference describe?', answer:'It identifies the peptide region used to describe sermorelin in the cited analytical literature. It is a molecular identity reference, separate from the 10mg amount stated on this catalog listing.', sources:['ghrh'], related:['tesamorelin-10','cjc1295-no-dac-10']
 },
 ipamorelin: {
  topic:'Ipamorelin', meta:'Ipamorelin 10mg research vial prices and pentapeptide reference information. Review material identity, lot documentation and 1–10 vial options.',
  overview:'Ipamorelin is a synthetic pentapeptide characterized in growth-hormone-secretagogue research. Its original characterization examined a GHRP-like receptor pathway in laboratory systems. This is a different research classification from the GHRH-related peptides sermorelin and tesamorelin.',
  checks:['Confirm the exact ipamorelin identity, including the specified amino-acid forms and terminal chemistry.','Review the counterion and analytical method for the offered lot; a shared 10mg label with another peptide does not establish molecular equivalence.'],
  question:'Does a 10mg ipamorelin vial match a 10mg GHRH-analogue vial?', answer:'Only the labeled mass is the same. Ipamorelin and GHRH analogues are distinct materials with different molecular identities. Review each specification independently.', sources:['ipa'], related:['sermorelin','tesamorelin-10']
 },
 'mela2-10': {
  topic:'Melanotan-2', meta:'Melanotan-2 10mg research vial and pack prices, cyclic-peptide reference information and molecular-identity checks. Laboratory research only.',
  overview:'Melanotan II, also written Melanotan-2, is described in chemical research as a cyclic heptapeptide. Its ring structure and amino-acid stereochemistry are part of its molecular identity. A listing in the same melanocortin research family does not establish that another peptide is the same material.',
  checks:['Ask for identity evidence that matches the intended cyclic peptide and its stereochemistry.','Keep Melanotan-2, Melanotan-1 and PT-141 identities separate when reviewing labels, analytical reports and purchase records.'],
  question:'Are Melanotan-1 and Melanotan-2 just different vial amounts?', answer:'No. They are separate named materials. The “1” and “2” distinguish the listings, while the 10mg label describes the amount stated for each vial.', sources:['mela2'], related:['mela1-10','pt141-10']
 },
 'mela1-10': {
  topic:'Melanotan-1', meta:'Melanotan-1 10mg research vials with alpha-MSH reference information, material-documentation checks and quantity-pack prices.',
  overview:'Melanotan-1 is listed separately from Melanotan-2 in this catalog. In alpha-MSH analogue research, amino-acid substitutions and stereochemistry distinguish reference materials. Review the supplied sequence against the intended reference rather than relying on a shortened melanotan name alone.',
  checks:['Request the full molecular identity and sequence for the offered Melanotan-1 material.','Verify the report names the same material and labeled amount as your order; a Melanotan-2 report is not a substitute.'],
  question:'What should be compared with the Melanotan-2 listing?', answer:'Compare molecular identity first, then the labeled amount, format and lot report. Matching 10mg labels or similar names do not establish that the materials can be substituted for one another.', sources:['mela1'], related:['mela2-10','pt141-10']
 },
 'nad-500': {
  topic:'NAD+', meta:'NAD+ 500mg research vial prices and chemical-reference information. Review oxidized-form identity, counterion and lot documentation before ordering.',
  overview:'NAD+ denotes the oxidized form of nicotinamide adenine dinucleotide, a coenzyme involved in electron-transfer chemistry. It is chemically distinct from the reduced form NADH and from phosphorylated NADP compounds. It is not a peptide, even when supplied in a dry vial format.',
  checks:['Confirm the oxidized NAD+ form and the supplier’s salt, counterion and water-content specification.','Match the 500mg label to the offered lot and ask how the stated amount was determined; related coenzyme names are not interchangeable.'],
  question:'Is NAD+ a research peptide?', answer:'NAD+ is a nucleotide coenzyme. The freeze-dried research-material collection includes both peptides and other materials, so supplied format should not be used as a chemical classification.', sources:['nad'], related:['glutathione-1500','mots-c']
 },
 'ghk-cu-50': {
  topic:'GHK-Cu 50mg', meta:'GHK-Cu 50mg research vial prices, copper-peptide references and documentation checks. Compare the 50mg and 100mg catalog listings.',
  overview:'GHK is the tripeptide glycyl-histidyl-lysine; GHK-Cu refers to its copper complex. Primary research has examined GHK-Cu in cultured fibroblasts. Copper-bound GHK and copper-free GHK are different reference materials, so the complex identity matters when reviewing a specification.',
  checks:['Ask whether the labeled amount refers to the copper complex and request its composition and analytical identity.','This listing states 50mg per vial. Confirm the same label on the offered lot instead of treating a 100mg report as a direct match.'],
  question:'How does the 50mg listing differ from GHK-Cu 100mg?', answer:'The stated amount per vial differs. Selecting two 50mg vials still means two separately labeled vials; it does not establish a common lot or make their packaging equivalent to one 100mg vial.', sources:['ghk'], related:['ghk-cu-100']
 },
 'ghk-cu-100': {
  topic:'GHK-Cu 100mg', meta:'Compare GHK-Cu 100mg research vial and pack prices with the 50mg listing. Review copper-complex identity and documentation for the supplied lot.',
  overview:'This listing states 100mg of GHK-Cu material per vial. GHK-Cu is the copper complex associated with the tripeptide glycyl-histidyl-lysine in the cited fibroblast research. The reference chemistry is separate from the amount, composition and assay evidence for a particular stock lot.',
  checks:['Confirm the copper-complex composition and whether the labeled mass includes counterions or other specified constituents.','Request documentation for the 100mg presentation and offered lot, even if you have previously reviewed a 50mg GHK-Cu sample.'],
  question:'Does a higher labeled amount mean higher purity?', answer:'No. The 100mg label describes the stated amount per vial. Purity, identity and amount are different measurements and must be checked separately in the relevant documentation.', sources:['ghk'], related:['ghk-cu-50']
 },
 'glow-70': {
  topic:'GLOW 70mg blend', meta:'GLOW 70mg research blend prices and purchasing checks. Confirm the complete component formula, individual amounts and blend-specific lot documentation.',
  overview:'GLOW is a catalog blend name, not a complete chemical specification. This listing states 70mg total per vial but does not publish a component-by-component formula. An experimental specification therefore needs the complete ingredient identities and individual amounts before a laboratory can evaluate this material.',
  checks:['Request the full formulation, the amount of every component and the total amount per vial in writing.','Ask for a blend-specific analytical report that identifies the components; do not substitute a report for a separately sold material.'],
  question:'Can the component amounts be inferred from “GLOW 70mg”?', answer:'No. The total label does not specify a formula or the amount of an individual ingredient. Confirm the composition for the offered lot before ordering; no standard formulation is assumed.', sources:[], related:['tb500-bpc157']
 },
 'mots-c': {
  topic:'MOTS-c', meta:'MOTS-c 10mg research vial and quantity prices, mitochondrial-peptide reference information and identity checks for laboratory procurement.',
  overview:'MOTS-c was described as a 16-amino-acid peptide encoded within a short open reading frame of mitochondrial 12S rRNA. The original work investigated cellular metabolic signaling and experimental models. The mitochondrial reference describes the peptide’s discovery, not the manufacturing origin of a supplied vial.',
  checks:['Request the sequence and identity evidence for the offered MOTS-c material.','Confirm the supplied form, counterion and amount separately from the research paper’s description of the endogenous peptide.'],
  question:'Does “mitochondrial-derived” describe how this vial was manufactured?', answer:'It describes the biological reference in the discovery literature. The listing alone does not establish the manufacturing method or source of a particular lot; request that information from the supplier.', sources:['mots'], related:['nad-500','slu-pp-332-10']
 },
 'retatrutide-10': {
  topic:'Retatrutide 10mg', meta:'Retatrutide 10mg research vial prices and receptor-structure references. Compare the 20mg presentation and check documentation for the exact lot.',
  overview:'Retatrutide, also identified in research as LY3437943, has been examined structurally at GLP-1, GIP and glucagon receptors. This 10mg listing is a separate presentation from the 20mg catalog item. Receptor research does not certify the identity or assay of either supplied presentation.',
  checks:['Confirm the retatrutide identity and the 10mg presentation on the documentation for the offered lot.','The published Retatrutide reports on this site concern 20mg samples. They should not be presented as direct evidence for a 10mg vial.'],
  question:'Do the published 20mg reports certify this 10mg listing?', answer:'No. Match the specific material, presentation and offered lot. The published 20mg sample reports remain available for review, but do not automatically characterize the 10mg stock.', sources:['reta'], related:['retatrutide-20','tirzepatide','semaglutide']
 },
 'retatrutide-20': {
  topic:'Retatrutide 20mg', meta:'Retatrutide 20mg research vial prices with direct links to published sample reports. Compare 10mg vials and review identity and lot matching.',
  overview:'The 20mg Retatrutide listing has two published sample reports available below. Separately, structural research describes retatrutide interactions with GLP-1, GIP and glucagon receptors. The research publication and the sample reports serve different purposes: molecular context and analytical results for submitted samples.',
  checks:['Review report identifiers COA261073-003 and COA261073-004 and ask which, if either, corresponds to the lot offered.','Confirm the 20mg presentation, identity method and measured amount. A shared product name does not establish that two reports describe the same stock lot.'],
  question:'Why are two Retatrutide reports linked?', answer:'The site publishes two separate report identifiers for 20mg samples. Review each original document and confirm its relationship to the supplied lot. They are not combined into a single purity claim.', sources:['reta'], reports:['reta003','reta004'], related:['retatrutide-10','tirzepatide','semaglutide']
 },
 'hcg-5000': {
  topic:'HCG 5000 IU', meta:'HCG 5000 IU research vial prices, glycoprotein-reference information and activity-label checks. Compare the separate 10,000 IU presentation.',
  overview:'Human chorionic gonadotropin (hCG) is a glycoprotein composed of alpha and beta subunits, as described in structural research. This catalog presentation is labeled in international units (IU), rather than milligrams. Molecular identity, activity measurement and mass are separate specification questions.',
  checks:['Request the identity, source and activity-assay documentation supporting the 5000 IU label.','Ask for the reference standard and lot identification; do not convert the IU label to a mass using an assumed universal conversion.'],
  question:'Is 5000 IU a weight in milligrams?', answer:'The catalog states an IU value, not a mass. Confirm the assay basis and supporting documentation for that activity label. A mass value cannot be inferred from the displayed IU number alone.', sources:['hcg'], related:['hcg-10000']
 },
 'hcg-10000': {
  topic:'HCG 10,000 IU', meta:'HCG 10,000 IU research vial and quantity prices. Review the activity-assay basis, subunit identity and documentation for the offered lot.',
  overview:'This HCG presentation is labeled 10,000 IU per vial. Structural work characterizes hCG as an alpha/beta glycoprotein heterodimer. A larger IU label does not by itself describe the protein mass, purity, glycosylation profile or manufacturing source of a supplied sample.',
  checks:['Confirm the assay basis and reference standard supporting the 10,000 IU presentation.','Review manufacturing source, identity and lot information independently of the 5000 IU catalog option.'],
  question:'Are two 5000 IU vials the same purchase as one 10,000 IU vial?', answer:'They are different presentations and quantities of containers. Labels alone do not establish a common source, lot, assay result or formulation. Compare the documents for the actual presentation you intend to purchase.', sources:['hcg'], related:['hcg-5000']
 },
 semaglutide: {
  topic:'Semaglutide', meta:'Semaglutide 10mg research vials with GLP-1 analogue references, molecular-identity checks and pack prices. Compare distinct research-material listings.',
  overview:'Semaglutide is an acylated GLP-1 analogue. Its discovery publication describes amino-acid substitutions and a modification at lysine 26, with laboratory characterization of receptor and albumin binding. These structural features distinguish the reference molecule from native GLP-1 and other named analogues.',
  checks:['Request identity evidence for the modified semaglutide molecule, rather than relying only on a generic peptide-purity percentage.','Confirm the 10mg presentation, counterion and lot documentation. A dry research vial is not evidence of equivalence to a finished medicinal formulation.'],
  question:'How does its research classification differ from tirzepatide?', answer:'The cited semaglutide work concerns a GLP-1 analogue. Tirzepatide research characterizes a distinct dual GIP/GLP-1 receptor agonist. These are separate molecular identities, not alternate names for the same material.', sources:['sema','tirz'], related:['tirzepatide','retatrutide-10']
 },
 tirzepatide: {
  topic:'Tirzepatide', meta:'Tirzepatide 10mg research vial prices, dual GIP/GLP-1 reference information and material-documentation checks. Compare single-vial and quantity packs.',
  overview:'Tirzepatide was described in discovery research under the identifier LY3298176 as a dual GIP and GLP-1 receptor agonist. Receptor identity and molecular characterization are useful when distinguishing it from other incretin-related research compounds. A shared 10mg vial label does not establish equivalent materials.',
  checks:['Match the molecular identity and any specified modifications to tirzepatide / LY3298176 in the offered lot documentation.','Review measured amount, chromatographic result and identity evidence as separate items; none can be established solely from the product title.'],
  question:'Is tirzepatide interchangeable with retatrutide in a material specification?', answer:'No. They are distinct reference compounds. The cited studies characterize tirzepatide at GIP and GLP-1 receptors and retatrutide at those receptors plus the glucagon receptor. Select and document the exact material required by your laboratory.', sources:['tirz','reta'], related:['semaglutide','retatrutide-10','retatrutide-20']
 },
 selank: {
  topic:'Selank', meta:'Selank 11mg research vial and pack prices with tuftsin-analogue references, material-identity checks and clear comparison with Semax.',
  overview:'Selank is described in primary research as a synthetic tuftsin analogue. Published work examined gene-expression responses in mouse tissues, including comparisons with peptide fragments. That research context does not establish a clinical use or verify the molecular identity of a supplied lot.',
  checks:['Request the exact Selank sequence and any terminal or salt-form specification.','Distinguish the intact reference peptide from fragments and modified derivatives; also confirm the unusual 11mg labeled presentation matches your order.'],
  question:'Are Selank and Semax the same because both listings are 11mg?', answer:'No. The names identify different peptides; 11mg is only the stated amount per vial. Compare molecular identity and documentation independently for each material.', sources:['selank'], related:['semax','dsip']
 },
 semax: {
  topic:'Semax', meta:'Semax 11mg research vial prices, published peptide-reference information and identity checks. Compare the separate Selank and DSIP listings.',
  overview:'Semax is described in primary research as a heptapeptide, with studies measuring BDNF expression in rat brain. The reference is associated with an ACTH-derived peptide sequence. Its name and research history do not establish that a supplied material is an intact, unmodified reference peptide.',
  checks:['Request the exact Semax sequence, terminal chemistry and counterion for the offered lot.','Confirm the 11mg presentation and distinguish the listed material from acetylated, amidated or other separately specified derivatives.'],
  question:'Does this listing specify a modified Semax derivative?', answer:'The catalog identifies Semax 11mg without specifying an additional derivative. Do not infer a terminal modification or a different molecular form from descriptions used by other suppliers; confirm the offered specification.', sources:['semax'], related:['selank','dsip']
 },
 dsip: {
  topic:'DSIP', meta:'DSIP 10mg research vial and quantity prices. Review the delta sleep-inducing peptide reference, sequence identity and lot-documentation checks.',
  overview:'DSIP is the abbreviation used for delta sleep-inducing peptide in the original chemical-characterization literature. That work described a nine-amino-acid peptide and compared related fragments and isomers. The historical name identifies a research reference and is not a promise of an effect from this catalog material.',
  checks:['Ask for sequence and identity evidence distinguishing the intended DSIP reference from fragments or isomers.','Match the 10mg label and lot number to the supplied report; a historical publication does not establish the composition of current stock.'],
  question:'Does the name “delta sleep-inducing peptide” establish an intended use?', answer:'It is the name used in the historical research literature. This listing is for laboratory procurement only and provides no human-use directions or outcome claim.', sources:['dsip'], related:['selank','semax']
 },
 'aod-9604': {
  topic:'AOD-9604', meta:'AOD-9604 10mg research vial prices, peptide-fragment identity references and documentation checks. Review the exact sequence for the supplied lot.',
  overview:'AOD9604 is described in analytical research as a C-terminal human-growth-hormone fragment corresponding to residues 177–191 with an added N-terminal tyrosine. The cited work investigated analytical detection and metabolites. A fragment designation is therefore a structural reference, not a description of full-length growth hormone.',
  checks:['Request sequence and identity confirmation for AOD-9604, including the specified terminal residue.','Check the complete molecular form rather than treating all “HGH fragment” descriptions as equivalent; confirm the 10mg label and offered lot.'],
  question:'Does “growth-hormone fragment” mean full-length growth hormone?', answer:'No. The cited AOD9604 reference describes a specific peptide fragment with an additional residue. Review the exact structure in the supplier documentation instead of assuming equivalence from the broader family name.', sources:['aod'], related:['tesamorelin-10','sermorelin']
 },
 'igf1-lr3': {
  topic:'IGF-1 LR3', meta:'IGF-1 LR3 1mg research vial and pack prices, Long R3 reference information and identity checks. Confirm the LR3 analogue and exact lot.',
  overview:'Long R3 IGF-I, commonly written IGF-1 LR3, is studied as an analogue of insulin-like growth factor I. Published experimental work distinguishes it from native IGF-I and describes different interactions with IGF-binding proteins. The LR3 designation is relevant to material identity rather than just vial size.',
  checks:['Confirm the Long R3 analogue on the identity report instead of accepting a report labeled only IGF-I.','This presentation states 1mg per vial. Review that amount carefully when comparing it with 10mg peptide listings or differently labeled materials.'],
  question:'Is IGF-1 LR3 simply a larger pack of IGF-1?', answer:'No. LR3 identifies an analogue in the research literature. Pack quantity is a separate catalog choice and changes the number of 1mg vials, not the reference molecule.', sources:['igf'], related:['sermorelin','tesamorelin-10']
 },
 'slu-pp-332-10': {
  topic:'SLU-PP-332', meta:'SLU-PP-332 10mg research compound prices and ERR-reference information. Review chemical identity and formulation separately from peptide listings.',
  overview:'SLU-PP-332 is a synthetic research compound characterized as an agonist of estrogen-related receptors ERRα, ERRβ and ERRγ. The original study examined receptor-dependent cellular and animal responses. These nuclear-receptor references should not be confused with the conventional estrogen receptors.',
  checks:['Confirm the exact SLU-PP-332 chemical identity, purity method and supplied formulation.','A freeze-dried vial format does not establish that this compound is a peptide or that any particular solvent is suitable. Request the relevant material documentation.'],
  question:'Does the freeze-dried format make SLU-PP-332 a peptide?', answer:'No. The catalog groups it with dry research materials by supplied format. Chemical identity and formulation must be reviewed separately from packaging or appearance.', sources:['slu'], related:['mots-c','nad-500']
 },
 'kpv-10': {
  topic:'KPV', meta:'KPV 10mg research vial and pack prices, Lys-Pro-Val tripeptide references and material-documentation checks for laboratory procurement.',
  overview:'KPV denotes the amino-acid sequence lysine–proline–valine. Primary research has examined this tripeptide in cell systems, including PepT1-mediated transport and signaling measurements. A short sequence name is useful for identification, but still needs to be matched to the supplied molecular form and lot.',
  checks:['Request confirmation of the Lys-Pro-Val identity, terminal chemistry and counterion.','The catalog describes this item as a research material. Confirm its actual supplied format and the evidence supporting the 10mg label before ordering.'],
  question:'Does KPV identify a vial quantity?', answer:'KPV is the one-letter amino-acid abbreviation used for the reference tripeptide. The separate 10mg label describes the stated amount in one vial; the quantity selector chooses how many vials are purchased.', sources:['kpv'], related:['ghk-cu-50','bpc157-10']
 },
 'cjc1295-dac-10': {
  topic:'CJC-1295 with DAC', meta:'CJC-1295 with DAC 10mg research vial prices, albumin-conjugation reference information and identity checks. Compare the separately labeled no-DAC item.',
  overview:'The original CJC-1295 research describes a modified GHRH analogue designed to conjugate with albumin through an added reactive group. This molecular feature matters when distinguishing the with-DAC listing from material sold under a without-DAC label. Similar names are not evidence of identical chemistry.',
  checks:['Request identity evidence for the specified albumin-binding modification as well as the peptide portion.','Confirm that the offered lot is explicitly identified as the with-DAC presentation; do not transfer measurements from a differently modified material.'],
  question:'Can a no-DAC report be used for this listing?', answer:'A report must identify the same molecular form as the offered material. The with-DAC and without-DAC catalog entries are separate; confirm the modification and lot match before procurement.', sources:['cjc'], related:['cjc1295-no-dac-10','sermorelin','tesamorelin-10']
 },
 'cjc1295-no-dac-10': {
  topic:'CJC-1295 without DAC', meta:'CJC-1295 without DAC 10mg research vial prices and naming checks. Confirm exact sequence and modification separately from the with-DAC material.',
  overview:'This catalog uses the label “CJC-1295 without DAC.” The original CJC-1295 publication studied an albumin-conjugating analogue, so its findings cannot automatically be assigned to a differently modified product. The exact sequence and terminal chemistry of the offered no-DAC material need independent confirmation.',
  checks:['Request the complete sequence, terminal chemistry and identity evidence for the material supplied under the no-DAC label.','Do not use the albumin-binding characteristics of the original CJC-1295 reference as proof of properties for this listing.'],
  question:'Does the original CJC-1295 paper characterize every no-DAC product?', answer:'No. That paper concerns a defined albumin-conjugating analogue. A supplier’s no-DAC label requires its own molecular specification; the name alone does not demonstrate equivalence to any reference sequence.', sources:['cjc'], related:['cjc1295-dac-10','sermorelin']
 },
 'pt141-10': {
  topic:'PT-141', meta:'PT-141 10mg research vial and pack prices, melanocortin-reference information and material-identity checks. Laboratory research purchasers only.',
  overview:'PT-141 is described in primary research as a synthetic alpha-MSH analogue acting at melanocortin receptors, including MC3R and MC4R. This places it in a research family that also contains other structurally distinct peptides. Receptor-family membership is not proof that the materials are interchangeable.',
  checks:['Request identity evidence specific to PT-141, including the molecular form and terminal chemistry.','Match the 10mg presentation and lot documentation independently of Melanotan-1 or Melanotan-2 reports.'],
  question:'Can a melanotan report stand in for a PT-141 report?', answer:'No. Similar research context does not establish identical molecular composition. Request documentation that identifies the PT-141 material and the lot being offered.', sources:['pt'], related:['mela1-10','mela2-10']
 },
 'bac-water-10ml': {
  topic:'Bacteriostatic water 10mL', meta:'Bacteriostatic water 10mL laboratory supply prices. Review preservative composition, volume and documentation; compare single-vial and quantity packs.',
  overview:'Bacteriostatic water refers to preserved water; a manufacturer example on DailyMed describes benzyl alcohol as the preservative. That reference label is not the specification or certification for this catalog item. Preservative identity and concentration must be confirmed for the actual supplied product.',
  checks:['Request the manufacturer label, preservative composition, lot number and expiry information for this 10mL supply.','Review any sterility or endotoxin evidence separately. Neither the name nor a generic reference label establishes the offered product’s test results or compatibility.'],
  question:'Is bacteriostatic water automatically included with research vials?', answer:'No. It is sold separately, and the checkout reminder is optional. Confirm that the supplied water specification meets your laboratory requirements before adding it; no solvent compatibility is assumed.', sources:['water'], related:[]
 },
 'glutathione-1500': {
  topic:'Glutathione 1.5g', meta:'Glutathione 1.5g (1500mg) research vial prices and tripeptide-reference information. Review oxidation state, supplied format and material documentation.',
  overview:'The reduced-glutathione reference record describes a tripeptide containing glutamate, cysteine and glycine. Glutathione identity and oxidation state are relevant to laboratory specifications. This catalog states 1.5g (1500mg) in a 10mL vial, supplied as lyophilized powder; vial capacity is not a prepared-solution concentration.',
  checks:['Confirm the supplied glutathione form, oxidation-state specification and analytical identity for the offered lot.','Review the labeled dry amount separately from the 10mL container description. The listing does not establish a ready-made solution or concentration.'],
  question:'Does the 10mL vial description mean the product is a 150mg/mL solution?', answer:'No. The listed format is lyophilized powder, with 1.5g (1500mg) stated per vial. A container description does not establish a solution volume or concentration.', sources:['gsh'], related:['nad-500','ghk-cu-50']
 }
};

const reports = {
 tb002:{id:'COA261073-002',sample:'TB-500 10mg sample',url:'https://verify.btlabtesting.com/view-pdf.php?folder=COA261073-002&file=ab7776f0-97f8-44a4-bf3c-4dd5d90ab031.pdf'},
 reta003:{id:'COA261073-003',sample:'Retatrutide 20mg sample',url:'https://verify.btlabtesting.com/view-pdf.php?folder=COA261073-003&file=6c2bc8a3-18c0-46ba-a24b-cc3947e9e564.pdf'},
 reta004:{id:'COA261073-004',sample:'Retatrutide 20mg sample',url:'https://verify.btlabtesting.com/view-pdf.php?folder=COA261073-004&file=2f1c1b69-4529-4159-9ea5-0a065a45c51b.pdf'}
};

function get(id) {
 const record=records[id];
 if(!record)throw new Error('Missing material reference: '+id);
 return record;
}
function documents(p) {
 const record=get(p.id), available=(record.reports||[]).map(id=>reports[id]);
 const links=available.map(r=>`<li><a href="${esc(r.url)}" rel="noopener">${esc(r.id)} · ${esc(r.sample)} · BTLabs verification ↗</a></li>`).join('');
 return `<section class="product-docs" aria-labelledby="docsTitle"><p class="eyebrow">Material documentation</p><h2 id="docsTitle">${available.length?'Published sample reports':'Request the report for your lot'}</h2>${available.length?`<p>These BTLabs documents describe submitted samples. Confirm which report, if any, applies to the stock lot offered for your order. The original-report portal requires name and email verification.</p><ul class="research-report-links">${links}</ul>`:`<p>A matching report for <strong>${esc(p.name)}</strong> is not currently linked in the public report library. Request the identity, analytical results and documentation for the specific lot before ordering.</p>`}<p>Match material identity, labeled amount and lot details. A reference paper or a report for another sample does not certify this stock.</p><div class="product-doc-links"><a href="/coa.html">View the report library ↗</a><a href="/how-to-review-a-coa.html">COA review checklist ↗</a><a href="https://wa.me/17542907210?text=${encodeURIComponent('Please send the current lot documentation for '+p.name+'. Please confirm the molecular identity, labeled amount and report-to-lot match. This is a laboratory research inquiry.')}" rel="noopener">Request lot documentation ↗</a></div></section>`;
}
function render(p) {
 const r=get(p.id);
 const citations=r.sources.map(key=>{const s=sources[key];if(!s)throw new Error('Missing source: '+key);return `<li><a href="${esc(s[0])}" rel="noopener">${esc(s[1])} ↗</a></li>`;}).join('');
 const related=r.related.map(id=>{if(!paths[id]||!records[id])throw new Error('Missing related material: '+id);return `<a href="${paths[id]}">${esc(records[id].topic)} ↗</a>`;}).join('');
 return `<!-- research-reference:start --><section class="research-reference" id="research-overview" aria-labelledby="researchOverviewTitle"><p class="eyebrow">Material reference</p><h2 id="researchOverviewTitle">${esc(r.topic)} research overview</h2><p class="research-overview">${esc(r.overview)}</p>${citations?`<div class="research-citations"><h3>Reference sources</h3><ul>${citations}</ul><p>Sources describe reference chemistry or published experiments. They do not establish identity, purity, suitability or effects for NXT LVL stock. No human-use instructions are provided.</p></div>`:'<p>Composition information must come from the documentation for the offered blend; no research findings are assigned to an unspecified formulation.</p>'}<h3>What to verify for this material</h3><ul class="research-checks">${r.checks.map(c=>'<li>'+esc(c)+'</li>').join('')}</ul><details class="research-question"><summary>${esc(r.question)}</summary><p>${esc(r.answer)}</p></details>${related?`<h3>Compare catalog listings</h3><p class="research-compare-note">These links help distinguish materials and presentations; they are not combination recommendations.</p><div class="catalog-hubs">${related}</div>`:''}<p class="research-editorial-note">Reference notes prepared by NXT LVL Research · Sources checked November 2, 2026. <a href="/how-to-review-a-coa.html">How to review analytical evidence ↗</a></p></section><!-- research-reference:end -->`;
}
function categoryContext() {
 return `<section class="research-reference" id="compare-peptides" aria-labelledby="comparePeptidesTitle"><p class="eyebrow">Compare material identities</p><h2 id="comparePeptidesTitle">Choose the reference material precisely.</h2><div class="research-topic-grid"><article><h3>GHRH-related names</h3><p><a href="${paths.sermorelin}#research-overview">Sermorelin</a>, <a href="${paths['tesamorelin-10']}#research-overview">tesamorelin</a> and the <a href="${paths['cjc1295-dac-10']}#research-overview">CJC-1295 with-DAC</a> listing require separate molecular specifications. The <a href="${paths['cjc1295-no-dac-10']}#research-overview">without-DAC label</a> also needs its own sequence and modification checks.</p></article><article><h3>Incretin-related materials</h3><p>Compare the individual reference notes for <a href="${paths.semaglutide}#research-overview">semaglutide</a>, <a href="${paths.tirzepatide}#research-overview">tirzepatide</a> and <a href="${paths['retatrutide-10']}#research-overview">retatrutide</a>. These are distinct molecules. Equal vial amounts do not establish equivalent identity or properties.</p></article><article><h3>Single materials and blends</h3><p>A <a href="${paths['tb500-bpc157']}#research-overview">blend in one vial</a> needs a complete component formula. A <a href="/research-package-deals.html">purchasing package</a> contains separately labeled vials. The total amount on a blend label does not establish the amount of each component.</p></article><article><h3>Quantity and documentation</h3><p>Compare <a href="${paths['ghk-cu-50']}#research-overview">GHK-Cu 50mg</a> with <a href="${paths['ghk-cu-100']}#research-overview">100mg</a> by presentation and lot. Use the <a href="/coa.html">published report library</a> and request missing lot documents before purchasing.</p></article></div></section>`;
}
module.exports={records,sources,reports,get,documents,render,categoryContext};
