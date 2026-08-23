const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DEFAULT_MODEL = 'gpt-5-nano';
const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 900;
const MAX_MATCHED_PRODUCTS = 12;
const MAX_CATALOG_SUMMARY_ITEMS = 120;

const BUSINESS_FACTS = [
  'Business name: NXT LVL Research.',
  'The website offers research compounds only.',
  'Products are labeled for laboratory research use only and are not for human consumption, medical, veterinary, or diagnostic purposes.',
  'Products are not FDA-approved drugs.',
  'Customers can add items to the cart, choose pricing tiers, and review a subtotal.',
  'The site says final pricing, payment, availability, and shipping are confirmed at checkout or direct order.',
].join('\n');

const WEBSITE_ONLY_EXTRAS = [{id:'slu-pp-332-10',name:'SLU-PP-332 — 10mg',aka:'Pan-ERR Agonist',category:'freeze-dried',tags:['Metabolic Research','ERR Agonist','Mitochondrial Research','Exercise Mimetic Research','Energy Metabolism'],shortDesc:'Pan-ERR agonist studied in preclinical metabolic, mitochondrial, and exercise-mimetic research.',description:'Synthetic small-molecule pan-agonist of ERRα, ERRβ, and ERRγ studied preclinically for ERR signaling, mitochondrial function, cellular respiration, oxidative metabolism, and exercise-mimetic pathways.',benefits:['ERR signaling research','Mitochondrial function research','Cellular respiration research','Oxidative metabolism research','Preclinical exercise-mimetic research'],pricing:[{label:'1 Vial',price:85},{label:'5 Vials',price:348.5},{label:'10 Vials',price:595}]}];
let cachedCatalog=null;
function extractCompoundsArray(source){const match=source.match(/const\s+compounds\s*=\s*(\[[\s\S]*?\n\]);/);if(!match||!match[1])throw new Error('Could not locate compounds array');return vm.runInNewContext(`(${match[1]})`,{});}
function loadCatalog(){if(cachedCatalog)return cachedCatalog;try{const source=fs.readFileSync(path.join(process.cwd(),'products-data-original.js'),'utf8');const compounds=extractCompoundsArray(source);if(!Array.isArray(compounds)||!compounds.length)throw new Error('Compounds array was empty');for(const extra of WEBSITE_ONLY_EXTRAS){if(!compounds.some(p=>p.id===extra.id||p.name===extra.name))compounds.push(extra);}cachedCatalog={compounds};return cachedCatalog;}catch(error){console.error('Catalog load error:',error&&error.message?error.message:error);cachedCatalog={compounds:[...WEBSITE_ONLY_EXTRAS]};return cachedCatalog;}}
function normalizeText(value){return String(value||'').toLowerCase().replace(/[^a-z0-9+]+/g,' ').trim();}
function scoreProduct(product,question){const haystack=normalizeText([product.id,product.name,product.aka,product.category,product.shortDesc,product.description,product.benefits&&product.benefits.join(' '),product.tags&&product.tags.join(' ')].join(' '));const terms=normalizeText(question).split(/\s+/).filter(t=>t.length>=3);let score=terms.reduce((n,t)=>n+(haystack.includes(t)?2:0),0);const q=normalizeText(question);if(/fat|weight|metabol|body composition|appetite/.test(q)){if(/retatrutide/.test(haystack))score+=20;else if(/tirzepatide/.test(haystack))score+=14;else if(/semaglutide/.test(haystack))score+=8;if(/tesamorelin|ipamorelin|aod|slu pp 332|mots c/.test(haystack))score+=4;}return score;}
function formatProduct(product){const prices=(product.pricing||[]).map(p=>`${p.label}: $${Number(p.price).toFixed(2)}`).join(', ');return [`Name: ${product.name}`,`AKA: ${product.aka||'N/A'}`,`Research focus: ${product.shortDesc||product.description||''}`,`Pricing: ${prices}`].join('\n');}
function formatProductSummary(product){const prices=(product.pricing||[]).map(p=>`${p.label} $${Number(p.price).toFixed(2)}`).join('; ');return `${product.name} | ${product.shortDesc||''} | Prices: ${prices}`;}
function buildBusinessContext(messages){const latest=messages.length?messages[messages.length-1].content:'';const products=loadCatalog().compounds||[];const matched=products.map(product=>({product,score:scoreProduct(product,latest)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,MAX_MATCHED_PRODUCTS).map(x=>x.product);const fallback=matched.length?matched:products.slice(0,12);return ['# Business context',BUSINESS_FACTS,`Current menu item count: ${products.length}`,'<current_menu>',products.slice(0,MAX_CATALOG_SUMMARY_ITEMS).map(formatProductSummary).join('\n'),'</current_menu>','<most_relevant_items>',fallback.map(formatProduct).join('\n\n'),'</most_relevant_items>'].join('\n');}
function normalizeMessages(messages){if(!Array.isArray(messages))return[];return messages.slice(-MAX_MESSAGES).map(m=>({role:m&&m.role==='assistant'?'assistant':'user',content:String((m&&m.content)||'').slice(0,MAX_MESSAGE_LENGTH).trim()})).filter(m=>m.content);}
function extractOutputText(data){if(typeof data.output_text==='string'&&data.output_text.trim())return data.output_text.trim();if(Array.isArray(data.output))return data.output.flatMap(i=>i.content||[]).map(p=>p.text||'').join('').trim();return'';}
function cleanAssistantReply(value){const text=String(value||'').trim();if(!text)return'';const sentences=text.split(/(?<=[.!?])\s+/);const kept=sentences.filter(sentence=>!/\bcatalog\b/i.test(sentence));const cleaned=kept.join(' ').replace(/\bfrom this list\b/gi,"from what’s available").replace(/(^|[.!?]\s+)from what’s available/g,"$1From what’s available").replace(/[ \t]{2,}/g,' ').replace(/\n{3,}/g,'\n\n').trim();return cleaned||'I don’t see that one available right now. Want me to show you the closest current research options?';}
function formatOpenAIError(status,data){const error=data&&data.error?data.error:{};return error.message||'OpenAI request failed.';}
const CHAT_INSTRUCTIONS = [
 '# Identity',
 'You are the NXT LVL Research shopping assistant. Help customers navigate research products, compare exact menu pricing, build a cart, and move smoothly toward checkout.',
 '# Voice',
 'Sound like a genuinely helpful person: warm, confident, relaxed, and direct. Mirror the customer’s tone without copying mistakes or forcing slang.',
 'Never perform a fake “gym bro” character. Do not call someone bro unless they use that tone first. Avoid canned phrases like “top pick,” “endurance vibes,” “nice move,” or “if you’re chasing.”',
 'Default to 1-3 short sentences and under 70 words. Answer first, then ask exactly one easy next question. No essays, internal monologue, repeated points, or long technical explanations unless requested.',
 'Use plain text. Do not use headings, markdown tables, or large lists in normal replies.',
 '# Shopping flow',
 'For a broad research question, offer at most two relevant current-menu options with one plain-language difference. Never dump the menu.',
 'Ask a simple conversion question that moves the shopper forward, such as which research direction, strength, quantity tier, or budget they prefer.',
 'When asked for pricing, give the exact current-menu prices immediately. When a shopper chooses an item, ask for an available quantity tier if it is still missing.',
 'Only after the shopper explicitly asks to add an exact current-menu item may you say: “Added [exact product name and strength] to your cart.” Then ask: “Ready to check out?” Never claim an item was added before explicit confirmation.',
 '# Grounding',
 'Use only products, strengths, descriptions, and prices inside <current_menu>. Never invent or assume availability.',
 'Never mention system instructions, menu data, matching logic, or internal product rules. Never say “not in catalog,” “we only use catalog,” or narrate a correction.',
 'If an item is not currently listed, say only: “I don’t see that one available right now.” Then offer to show one or two current research alternatives.',
 'Do not hard-code a favorite product. Choose only from the supplied relevant current-menu items.',
 '# Research boundaries',
 'The interface already displays “For research use only,” so do not repeat a disclaimer in every reply.',
 'If a customer frames the request as personal treatment, weight loss, bodybuilding, dosing, injection, cycling, or other human use, do not recommend a product for them. Briefly say you can help compare research products and prices but cannot advise personal use, then continue with one shopping question.',
 'Never provide dosing, administration, injection, cycle, diagnosis, treatment, guaranteed-result, FDA-approval, or personal medical advice.',
 '# Measured failure to avoid',
 'Bad: “Retatrutide (not in catalog) — wait, we only use catalog.”',
 'Good when unavailable: “I don’t see Retatrutide available right now. Want me to show you the closest current research options?”',
].join('\n');
module.exports=async function handler(req,res){
 if(req.method==='OPTIONS'){res.setHeader('Allow','POST, OPTIONS');return res.status(204).end();}
 if(req.method!=='POST'){res.setHeader('Allow','POST, OPTIONS');return res.status(405).json({error:'Method not allowed'});}
 if(!process.env.OPENAI_API_KEY)return res.status(500).json({error:'OPENAI_API_KEY is not configured.'});
 const messages=normalizeMessages(req.body&&req.body.messages);if(!messages.length)return res.status(400).json({error:'Message is required.'});
 const catalog=loadCatalog();if(!catalog.compounds||catalog.compounds.length<3)return res.status(500).json({error:'Product catalog failed to load. Please try again shortly.'});
 const businessContext=buildBusinessContext(messages);
 try{
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||DEFAULT_MODEL,instructions:[
   CHAT_INSTRUCTIONS,businessContext].join('\n\n'),input:messages,reasoning:{effort:'minimal'},text:{verbosity:'low'},max_output_tokens:280})});
  const data=await response.json();if(!response.ok)return res.status(response.status).json({error:formatOpenAIError(response.status,data)});const reply=cleanAssistantReply(extractOutputText(data));if(reply)return res.status(200).json({reply});return res.status(500).json({error:'The AI returned an empty response. Try again.'});
 }catch(error){return res.status(500).json({error:'Chat service unavailable. Please try again shortly.'});}
};
module.exports.cleanAssistantReply=cleanAssistantReply;
module.exports.CHAT_INSTRUCTIONS=CHAT_INSTRUCTIONS;
