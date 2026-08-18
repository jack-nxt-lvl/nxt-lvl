const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DEFAULT_MODEL = 'gpt-5-nano';
const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 900;
const MAX_MATCHED_PRODUCTS = 6;
const MAX_CATALOG_SUMMARY_ITEMS = 80;

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
  'Peptide and research-compound literature commonly distinguishes receptor/signaling targets, metabolic pathways, mitochondrial function, stability, delivery, and pharmacokinetic limitations.',
  'Clearly distinguish preclinical research from established human clinical evidence. Never present animal, cell, or early-stage findings as proven human outcomes.',
  'Keep explanations consumer-friendly: exact product name, what pathway or research area it is studied for, and the key way it differs from the other website options.',
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
function loadCatalog() {
  if (cachedCatalog) return cachedCatalog;
  const candidates = ['products-data-original.js', 'products-data.js'];
  for (const file of candidates) {
    try {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      const context = { console: { log() {}, warn() {}, error() {} } };
      const result = vm.runInNewContext(`${source}\n({ compounds, categories, protocols, stacks });`, context);
      if (result && Array.isArray(result.compounds) && result.compounds.length) {
        for (const extra of WEBSITE_ONLY_EXTRAS) {
          if (!result.compounds.some((p) => p.id === extra.id || p.name === extra.name)) result.compounds.push(extra);
        }
        cachedCatalog = result;
        return cachedCatalog;
      }
    } catch (_) {}
  }
  cachedCatalog = { compounds: [...WEBSITE_ONLY_EXTRAS], categories: [], protocols: [], stacks: [] };
  return cachedCatalog;
}
function normalizeText(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim(); }
function scoreProduct(product, question) {
  const haystack = normalizeText([product.id, product.name, product.aka, product.category, product.shortDesc, product.description, product.benefits && product.benefits.join(' '), product.tags && product.tags.join(' ')].join(' '));
  return normalizeText(question).split(/\s+/).filter((term) => term.length >= 3).reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}
function formatProduct(product, categories) {
  const category = categories.find((item) => item.id === product.category);
  const prices = (product.pricing || []).map((price) => `${price.label}: $${Number(price.price).toFixed(2)}`).join(', ');
  return [`Name: ${product.name}`, `AKA: ${product.aka || 'N/A'}`, `Category: ${category ? category.name : product.category}`, `Tags: ${(product.tags || []).join(', ')}`, `Short description: ${product.shortDesc || ''}`, `Product description: ${product.description || ''}`, `Listed research notes: ${(product.benefits || []).join('; ')}`, `Pricing: ${prices}`].join('\n');
}
function formatProductSummary(product, categories) {
  const category = categories.find((item) => item.id === product.category);
  const prices = (product.pricing || []).map((price) => `${price.label} $${Number(price.price).toFixed(2)}`).join('; ');
  return `${product.name} (${product.aka || 'N/A'}) | ${category ? category.name : product.category} | ${product.shortDesc || ''} | Prices: ${prices}`;
}
function formatStack(stack) { return [`${stack.name}: ${stack.goal}`, `Products: ${(stack.compounds || []).map((compound) => `${compound.name} (${compound.role})`).join(', ')}`].join(' '); }
function buildBusinessContext(messages) {
  const latestQuestion = messages.length ? messages[messages.length - 1].content : '';
  const catalog = loadCatalog(); const products = catalog.compounds || []; const categories = catalog.categories || []; const protocols = catalog.protocols || []; const stacks = catalog.stacks || [];
  const matchedProducts = products.map((product) => ({ product, score: scoreProduct(product, latestQuestion) })).filter((item) => item.score > 0).sort((a,b) => b.score-a.score).slice(0,MAX_MATCHED_PRODUCTS).map((item)=>item.product);
  const fallbackProducts = matchedProducts.length ? matchedProducts : products.slice(0,6);
  return ['NXT LVL WEBSITE CATALOG. THIS IS THE ONLY PRODUCT SOURCE YOU MAY USE.','','Business facts:',BUSINESS_FACTS,'','Research-reference guidance:',RESEARCH_REFERENCE,'',`Categories: ${categories.map((category)=>category.name).join(', ')}`,`Protocols: ${protocols.map((protocol)=>`${protocol.name} - ${protocol.description}`).join(' | ')}`,`Curated stacks: ${stacks.map(formatStack).join(' | ')}`,'','Website product list:',products.slice(0,MAX_CATALOG_SUMMARY_ITEMS).map((product)=>formatProductSummary(product,categories)).join('\n'),'','Most relevant website products:',fallbackProducts.map((product)=>formatProduct(product,categories)).join('\n\n---\n\n')].join('\n');
}
function normalizeMessages(messages) { if (!Array.isArray(messages)) return []; return messages.slice(-MAX_MESSAGES).map((message)=>({role: message && message.role === 'assistant' ? 'assistant':'user',content:String((message&&message.content)||'').slice(0,MAX_MESSAGE_LENGTH).trim()})).filter((message)=>message.content); }
function extractOutputText(data) { if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text.trim(); if (Array.isArray(data.output)) return data.output.flatMap((item)=>item.content||[]).map((part)=>part.text||'').join('').trim(); return ''; }
function formatOpenAIError(status,data) { const error=data&&data.error?data.error:{}; return error.message||'OpenAI request failed.'; }

module.exports = async function handler(req,res) {
  if(req.method==='OPTIONS'){res.setHeader('Allow','POST, OPTIONS');return res.status(204).end();}
  if(req.method!=='POST'){res.setHeader('Allow','POST, OPTIONS');return res.status(405).json({error:'Method not allowed'});}
  if(!process.env.OPENAI_API_KEY)return res.status(500).json({error:'OPENAI_API_KEY is not configured.'});
  const messages=normalizeMessages(req.body&&req.body.messages); if(!messages.length)return res.status(400).json({error:'Message is required.'});
  const businessContext=buildBusinessContext(messages);
  const firstUserTurn = messages.filter((message)=>message.role==='user').length <= 1;
  try {
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||DEFAULT_MODEL,instructions:[
      'You are NXT LVL Research’s ecommerce catalog assistant. Be short, confident, natural, and useful.',
      'ABSOLUTE RULE: Use ONLY exact products that appear in the supplied NXT LVL WEBSITE CATALOG. Do not recommend, mention, substitute, or invent any product that is not currently sold on the website.',
      'NEVER use placeholders like X, Y, Product A, Product B, or unnamed compounds. Every product mention must be an exact website product name.',
      'If the website catalog does not contain a relevant product, simply say there is no matching website product instead of suggesting something external.',
      'When a shopper asks what is best, asks for a recommendation, or gives a broad research goal, give 2-3 relevant website options whenever at least 2 relevant catalog products exist. Do not give only one option unless only one website product genuinely matches.',
      'For each option, use the exact product name followed by one concise plain-English sentence explaining its listed research focus or mechanism and what makes it distinct.',
      'If clarification would materially improve the answer, ask one short question after giving useful options rather than refusing to provide options.',
      'If two or more website products have complementary listed research roles, briefly explain the catalog rationale for pairing them. Do not invent synergy or personal outcomes.',
      'For injectable-category products, provide factual website catalog information only. Do not personalize injectable recommendations based on sex, health status, or physique goals.',
      firstUserTurn ? 'FIRST USER TURN RULE: Do NOT ask to add anything to the cart and do NOT use a checkout close on the first user message. Give useful options/information first.' : 'On later turns, after the shopper shows interest in a specific product or stack, you may use one simple cart close such as “Want me to add that to your cart?”',
      'Keep responses compact: usually 3-6 short lines or sentences, enough to show 2-3 useful options without a long lecture.',
      'Do not give human or animal dosing, injection, administration, cycle/protocol instructions, diagnosis, treatment instructions, or personalized medical advice.',
      'Do not claim a product will make a person lose fat, gain muscle, heal, or produce a medical result. Clearly distinguish preclinical research from proven human outcomes.',
      'Mention “For research use only.” at most once when relevant; do not lead every answer with it.',
      '',businessContext].join(' '),input:messages,reasoning:{effort:'minimal'},text:{verbosity:'low'},max_output_tokens:900})});
    const data=await response.json(); if(!response.ok)return res.status(response.status).json({error:formatOpenAIError(response.status,data)});
    const reply=extractOutputText(data); if(reply)return res.status(200).json({reply});
    return res.status(500).json({error:'The AI returned an empty response. Try again.'});
  } catch(error){return res.status(500).json({error:'Chat service unavailable. Please try again shortly.'});}
};
