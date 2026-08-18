const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DEFAULT_MODEL = 'gpt-5-nano';
const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 900;
const MAX_MATCHED_PRODUCTS = 8;
const MAX_CATALOG_SUMMARY_ITEMS = 100;

const BUSINESS_FACTS = [
  'Business name: NXT LVL Research.',
  'The website offers research compounds only.',
  'Products are labeled for laboratory research use only and are not for human consumption, medical, veterinary, or diagnostic purposes.',
  'Products are not FDA-approved drugs.',
  'Customers can add items to the cart, choose pricing tiers, and review a subtotal.',
  'The site says final pricing, payment, availability, and shipping are confirmed at checkout or direct order.',
].join('\n');

const RESEARCH_REFERENCE = [
  'Use established peptide/pharmacology concepts to explain mechanisms accurately, but never use outside references to invent products, benefits, or claims.',
  'Clearly distinguish preclinical research from established human clinical evidence.',
  'Keep explanations consumer-friendly: exact product name, research area, and the key difference from other website options.',
].join('\n');

const WEBSITE_ONLY_EXTRAS = [
  {
    id: 'slu-pp-332-10',
    name: 'SLU-PP-332 — 10mg',
    aka: 'Pan-ERR Agonist',
    category: 'freeze-dried',
    tags: ['Metabolic Research', 'ERR Agonist', 'Mitochondrial Research', 'Exercise Mimetic Research', 'Energy Metabolism'],
    shortDesc: 'Pan-ERR agonist studied in preclinical metabolic, mitochondrial, and exercise-mimetic research.',
    description: 'Synthetic small-molecule pan-agonist of ERRα, ERRβ, and ERRγ studied preclinically for ERR signaling, mitochondrial function, cellular respiration, oxidative metabolism, and exercise-mimetic pathways.',
    benefits: ['ERR signaling research', 'Mitochondrial function research', 'Cellular respiration research', 'Oxidative metabolism research', 'Preclinical exercise-mimetic research'],
    pricing: [
      { label: '1 Vial', price: 85 },
      { label: '5 Vials', price: 348.5 },
      { label: '10 Vials', price: 595 }
    ]
  }
];

let cachedCatalog = null;

function extractCompoundsArray(source) {
  const match = source.match(/const\s+compounds\s*=\s*(\[[\s\S]*?\n\]);/);
  if (!match || !match[1]) throw new Error('Could not locate compounds array');
  return vm.runInNewContext(`(${match[1]})`, {});
}

function loadCatalog() {
  if (cachedCatalog) return cachedCatalog;
  try {
    const source = fs.readFileSync(path.join(process.cwd(), 'products-data-original.js'), 'utf8');
    const compounds = extractCompoundsArray(source);
    if (!Array.isArray(compounds) || !compounds.length) throw new Error('Compounds array was empty');
    for (const extra of WEBSITE_ONLY_EXTRAS) {
      if (!compounds.some((p) => p.id === extra.id || p.name === extra.name)) compounds.push(extra);
    }
    cachedCatalog = { compounds, categories: [], protocols: [], stacks: [] };
    return cachedCatalog;
  } catch (error) {
    console.error('Catalog load error:', error && error.message ? error.message : error);
    cachedCatalog = { compounds: [...WEBSITE_ONLY_EXTRAS], categories: [], protocols: [], stacks: [] };
    return cachedCatalog;
  }
}

function normalizeText(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim(); }
function scoreProduct(product, question) {
  const haystack = normalizeText([product.id, product.name, product.aka, product.category, product.shortDesc, product.description, product.benefits && product.benefits.join(' '), product.tags && product.tags.join(' '), product.protocols && product.protocols.join(' ')].join(' '));
  const terms = normalizeText(question).split(/\s+/).filter((term) => term.length >= 3);
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 2 : 0), 0) + ((product.protocols || []).some(p => terms.some(t => normalizeText(p).includes(t))) ? 3 : 0);
}
function formatProduct(product) {
  const prices = (product.pricing || []).map((price) => `${price.label}: $${Number(price.price).toFixed(2)}`).join(', ');
  return [`Name: ${product.name}`, `AKA: ${product.aka || 'N/A'}`, `Category: ${product.category || 'N/A'}`, `Tags: ${(product.tags || []).join(', ')}`, `Short description: ${product.shortDesc || ''}`, `Product description: ${product.description || ''}`, `Listed research notes: ${(product.benefits || []).join('; ')}`, `Pricing: ${prices}`].join('\n');
}
function formatProductSummary(product) {
  const prices = (product.pricing || []).map((price) => `${price.label} $${Number(price.price).toFixed(2)}`).join('; ');
  return `${product.name} (${product.aka || 'N/A'}) | ${product.category || 'N/A'} | ${product.shortDesc || ''} | Prices: ${prices}`;
}
function buildBusinessContext(messages) {
  const latestQuestion = messages.length ? messages[messages.length - 1].content : '';
  const catalog = loadCatalog();
  const products = catalog.compounds || [];
  const matchedProducts = products.map((product) => ({ product, score: scoreProduct(product, latestQuestion) })).filter((item) => item.score > 0).sort((a,b) => b.score-a.score).slice(0,MAX_MATCHED_PRODUCTS).map((item)=>item.product);
  const fallbackProducts = matchedProducts.length >= 3 ? matchedProducts : products.slice(0,12);
  return ['NXT LVL WEBSITE CATALOG. THIS IS THE ONLY PRODUCT SOURCE YOU MAY USE.','','Business facts:',BUSINESS_FACTS,'','Research-reference guidance:',RESEARCH_REFERENCE,'',`Catalog product count: ${products.length}`,'','Website product list:',products.slice(0,MAX_CATALOG_SUMMARY_ITEMS).map(formatProductSummary).join('\n'),'','Relevant website products:',fallbackProducts.map(formatProduct).join('\n\n---\n\n')].join('\n');
}
function normalizeMessages(messages) { if (!Array.isArray(messages)) return []; return messages.slice(-MAX_MESSAGES).map((message)=>({role: message && message.role === 'assistant' ? 'assistant':'user',content:String((message&&message.content)||'').slice(0,MAX_MESSAGE_LENGTH).trim()})).filter((message)=>message.content); }
function extractOutputText(data) { if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text.trim(); if (Array.isArray(data.output)) return data.output.flatMap((item)=>item.content||[]).map((part)=>part.text||'').join('').trim(); return ''; }
function formatOpenAIError(status,data) { const error=data&&data.error?data.error:{}; return error.message||'OpenAI request failed.'; }

module.exports = async function handler(req,res) {
  if(req.method==='OPTIONS'){res.setHeader('Allow','POST, OPTIONS');return res.status(204).end();}
  if(req.method!=='POST'){res.setHeader('Allow','POST, OPTIONS');return res.status(405).json({error:'Method not allowed'});}
  if(!process.env.OPENAI_API_KEY)return res.status(500).json({error:'OPENAI_API_KEY is not configured.'});
  const messages=normalizeMessages(req.body&&req.body.messages); if(!messages.length)return res.status(400).json({error:'Message is required.'});
  const catalog=loadCatalog();
  if (!catalog.compounds || catalog.compounds.length < 3) return res.status(500).json({error:'Product catalog failed to load. Please try again shortly.'});
  const businessContext=buildBusinessContext(messages);
  const firstUserTurn = messages.filter((message)=>message.role==='user').length <= 1;
  try {
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||DEFAULT_MODEL,instructions:[
      'You are NXT LVL Research’s ecommerce catalog assistant. Be short, confident, natural, and useful.',
      'ABSOLUTE RULE: Use ONLY exact products in the supplied NXT LVL WEBSITE CATALOG.',
      'NEVER use placeholders or unnamed compounds.',
      'For broad questions such as “I want to lose fat,” “best for recovery,” or “best product,” ALWAYS provide 2-3 different relevant website products when the catalog contains them. Never answer with only SLU-PP-332 when other relevant website products exist.',
      'For fat-metabolism/body-composition research questions, inspect the full catalog for products tagged or described around fat loss, body composition, metabolism, GH/GHRH, appetite, or energy metabolism and present 2-3 distinct website options.',
      'For each option: exact product name, then one short sentence on its listed research focus and what makes it different.',
      'Do not claim guaranteed human results. Keep preclinical findings clearly labeled where applicable.',
      firstUserTurn ? 'FIRST TURN: Do not ask to add anything to cart. Give useful choices first.' : 'On later turns, only after the shopper shows interest in a specific item, you may offer to add that item to cart.',
      'Keep responses compact: about 3-6 short lines.',
      'Do not give dosing, injection, administration, cycle, protocol, diagnosis, or treatment instructions.',
      'Mention “For research use only.” at most once and do not lead with it unless necessary.',
      '',businessContext].join(' '),input:messages,reasoning:{effort:'minimal'},text:{verbosity:'low'},max_output_tokens:900})});
    const data=await response.json(); if(!response.ok)return res.status(response.status).json({error:formatOpenAIError(response.status,data)});
    const reply=extractOutputText(data); if(reply)return res.status(200).json({reply});
    return res.status(500).json({error:'The AI returned an empty response. Try again.'});
  } catch(error){return res.status(500).json({error:'Chat service unavailable. Please try again shortly.'});}
};
