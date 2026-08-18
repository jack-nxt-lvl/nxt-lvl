const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DEFAULT_MODEL = 'gpt-5-nano';
const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 900;
const MAX_MATCHED_PRODUCTS = 4;
const MAX_CATALOG_SUMMARY_ITEMS = 60;

const BUSINESS_FACTS = [
  'Business name: NXT LVL Research.',
  'The website offers research compounds only.',
  'Products are labeled for laboratory research use only and are not for human consumption, medical, veterinary, or diagnostic purposes.',
  'Products are not FDA-approved drugs.',
  'Customers can add items to the cart, choose pricing tiers, and review a subtotal.',
  'The site says final pricing, payment, availability, and shipping are confirmed at checkout or direct order.',
  'The site mentions a crypto discount may be available; customers should ask for details.',
].join('\n');

let cachedCatalog = null;
function loadCatalog() {
  if (cachedCatalog) return cachedCatalog;
  try {
    const source = fs.readFileSync(path.join(process.cwd(), 'products-data.js'), 'utf8');
    cachedCatalog = vm.runInNewContext(`${source}\n({ compounds, categories, protocols, stacks });`, {});
  } catch (error) { cachedCatalog = { compounds: [], categories: [], protocols: [], stacks: [] }; }
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
  return [`Name: ${product.name}`, `AKA: ${product.aka || 'N/A'}`, `Category: ${category ? category.name : product.category}`, `Tags: ${(product.tags || []).join(', ')}`, `Short description: ${product.shortDesc || ''}`, `Product description: ${product.description || ''}`, `Listed research notes: ${(product.benefits || []).join('; ')}`, `Pricing: ${prices}`, `Important warning: ${product.warnings || 'Research use only; not for human consumption.'}`].join('\n');
}
function formatProductSummary(product, categories) {
  const category = categories.find((item) => item.id === product.category);
  const prices = (product.pricing || []).map((price) => `${price.label} $${Number(price.price).toFixed(2)}`).join('; ');
  return `${product.name} (${product.aka || 'N/A'}) | ${category ? category.name : product.category} | ${product.shortDesc || ''} | Prices: ${prices}`;
}
function formatStack(stack) { return [`${stack.name}: ${stack.goal}`, `Products: ${(stack.compounds || []).map((compound) => `${compound.name} (${compound.role})`).join(', ')}`, `Duration listed: ${stack.duration || 'N/A'}`].join(' '); }
function buildBusinessContext(messages) {
  const latestQuestion = messages.length ? messages[messages.length - 1].content : '';
  const catalog = loadCatalog(); const products = catalog.compounds || []; const categories = catalog.categories || []; const protocols = catalog.protocols || []; const stacks = catalog.stacks || [];
  const matchedProducts = products.map((product) => ({ product, score: scoreProduct(product, latestQuestion) })).filter((item) => item.score > 0).sort((a,b) => b.score-a.score).slice(0,MAX_MATCHED_PRODUCTS).map((item)=>item.product);
  const fallbackProducts = matchedProducts.length ? matchedProducts : products.slice(0,3);
  return ['NXT LVL business and catalog context. Use only this context for business and product-specific answers.','','Business facts:',BUSINESS_FACTS,'',`Categories: ${categories.map((category)=>category.name).join(', ')}`,`Protocols: ${protocols.map((protocol)=>`${protocol.name} - ${protocol.description}`).join(' | ')}`,`Curated stacks: ${stacks.map(formatStack).join(' | ')}`,'','Catalog summary:',products.slice(0,MAX_CATALOG_SUMMARY_ITEMS).map((product)=>formatProductSummary(product,categories)).join('\n'),'','Detailed context for the most relevant products:',fallbackProducts.map((product)=>formatProduct(product,categories)).join('\n\n---\n\n')].join('\n');
}
function normalizeMessages(messages) { if (!Array.isArray(messages)) return []; return messages.slice(-MAX_MESSAGES).map((message)=>({role: message && message.role === 'assistant' ? 'assistant':'user',content:String((message&&message.content)||'').slice(0,MAX_MESSAGE_LENGTH).trim()})).filter((message)=>message.content); }
function extractOutputText(data) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  if (Array.isArray(data.output)) {
    const text = data.output.flatMap((item)=>item.content||[]).map((part)=>part.text||part.refusal||'').join('').trim();
    if (text) return text;
  }
  return '';
}
function formatOpenAIError(status,data) { const error=data&&data.error?data.error:{}; const code=error.code||error.type||''; const message=error.message||'OpenAI request failed.'; if(status===429){if(code.includes('spend_limit'))return 'OpenAI spend limit reached.';if(code.includes('usage_limit')||code.includes('insufficient_quota'))return 'OpenAI billing or credits are not active yet.';return 'OpenAI rate limit reached. Try again shortly.';} if(status===404||code.includes('model'))return 'OpenAI model is not available for this project.'; return message; }

module.exports = async function handler(req,res) {
  if(req.method==='OPTIONS'){res.setHeader('Allow','POST, OPTIONS');return res.status(204).end();}
  if(req.method!=='POST'){res.setHeader('Allow','POST, OPTIONS');return res.status(405).json({error:'Method not allowed'});}
  if(!process.env.OPENAI_API_KEY)return res.status(500).json({error:'OPENAI_API_KEY is not configured.'});
  const messages=normalizeMessages(req.body&&req.body.messages); if(!messages.length)return res.status(400).json({error:'Message is required.'});
  const businessContext=buildBusinessContext(messages);
  try {
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||DEFAULT_MODEL,instructions:[
      'You are NXT LVL Research’s top ecommerce sales closer. Sound like a confident, energetic, natural human salesperson: decisive, conversational, enthusiastic, and focused on making the buying decision simple. Do not imitate or claim to be any real person.',
      'Keep responses SHORT. Usually 2-4 short sentences. Never write an essay. Never sound academic, robotic, defensive, or like a compliance bot.',
      'Lead with the product names immediately. Explain each product in one plain-English line using only the supplied catalog research information.',
      'STACK SALES: When 2 or more catalog products complement the same research objective, sell them as a stack. Briefly explain WHY they pair together by describing their different research roles and how those roles complement each other. Use curated stacks from the catalog whenever relevant. Never invent synergy, outcomes, or benefits not supported by the catalog.',
      'CLOSE THE SALE: After a relevant recommendation or stack, end with one direct, natural close such as “Want me to add that stack to your cart?” or “Want me to put those in your cart and get checkout ready?” Do not ask multiple questions.',
      'When pricing is available and useful, mention it clearly. If there are multiple tiers, keep the presentation simple and emphasize value without inventing savings.',
      'Do not repeatedly say what you cannot do. Give the useful catalog answer first. Mention “For research use only.” at most once when relevant, preferably as a short final note rather than the main answer.',
      'Do not give human or animal dosing, injection, administration, cycle/protocol instructions, diagnosis, treatment instructions, or personalized medical advice. Do not claim products will make a person lose fat, gain muscle, heal, or produce a medical result. For personal-use requests, translate the goal into relevant catalog research areas and discuss the products on that basis.',
      'Never call a product FDA-approved, a treatment, cure, prescription, or proven solution unless the supplied catalog explicitly establishes that fact.',
      'Never invent product details, prices, research findings, availability, checkout capabilities, discounts, or guarantees.',
      'Do not push contact links or phone numbers unless specifically asked. Keep the customer moving toward the website cart and checkout.',
      'Example tone: “For that research focus, I’d look at X + Y. X is studied for ___, while Y focuses on ___, so the stack covers two complementary research angles instead of overlapping. Want me to add the stack to your cart?”',
      '',businessContext].join(' '),input:messages,reasoning:{effort:'minimal'},text:{verbosity:'low'},max_output_tokens:900})});
    const data=await response.json(); if(!response.ok)return res.status(response.status).json({error:formatOpenAIError(response.status,data)});
    const reply=extractOutputText(data); if(reply)return res.status(200).json({reply});
    if(data && data.status==='incomplete') return res.status(500).json({error:'The AI response was cut off before text was produced. Please try again.'});
    return res.status(500).json({error:'The AI returned an empty response. Try again.'});
  } catch(error){return res.status(500).json({error:'Chat service unavailable. Please try again shortly.'});}
};
