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
function buildBusinessContext(messages){const latest=messages.length?messages[messages.length-1].content:'';const products=loadCatalog().compounds||[];const matched=products.map(product=>({product,score:scoreProduct(product,latest)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,MAX_MATCHED_PRODUCTS).map(x=>x.product);const fallback=matched.length?matched:products.slice(0,12);return ['NXT LVL WEBSITE CATALOG — ONLY USE PRODUCTS FROM HERE.','Business facts:',BUSINESS_FACTS,`Catalog product count: ${products.length}`,'Website product list:',products.slice(0,MAX_CATALOG_SUMMARY_ITEMS).map(formatProductSummary).join('\n'),'Relevant products:',fallback.map(formatProduct).join('\n\n')].join('\n');}
function normalizeMessages(messages){if(!Array.isArray(messages))return[];return messages.slice(-MAX_MESSAGES).map(m=>({role:m&&m.role==='assistant'?'assistant':'user',content:String((m&&m.content)||'').slice(0,MAX_MESSAGE_LENGTH).trim()})).filter(m=>m.content);}
function extractOutputText(data){if(typeof data.output_text==='string'&&data.output_text.trim())return data.output_text.trim();if(Array.isArray(data.output))return data.output.flatMap(i=>i.content||[]).map(p=>p.text||'').join('').trim();return'';}
function formatOpenAIError(status,data){const error=data&&data.error?data.error:{};return error.message||'OpenAI request failed.';}
module.exports=async function handler(req,res){
 if(req.method==='OPTIONS'){res.setHeader('Allow','POST, OPTIONS');return res.status(204).end();}
 if(req.method!=='POST'){res.setHeader('Allow','POST, OPTIONS');return res.status(405).json({error:'Method not allowed'});}
 if(!process.env.OPENAI_API_KEY)return res.status(500).json({error:'OPENAI_API_KEY is not configured.'});
 const messages=normalizeMessages(req.body&&req.body.messages);if(!messages.length)return res.status(400).json({error:'Message is required.'});
 const catalog=loadCatalog();if(!catalog.compounds||catalog.compounds.length<3)return res.status(500).json({error:'Product catalog failed to load. Please try again shortly.'});
 const businessContext=buildBusinessContext(messages);
 try{
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||DEFAULT_MODEL,instructions:[
   'You are the NXT LVL Research website sales assistant. Talk like a knowledgeable gym bro helping another gym guy shop: casual, confident, simple, quick, and useful. Do not sound like a scientist, textbook, doctor, or corporate chatbot.',
   'Keep answers SHORT. Usually 2-5 short sentences. Use common gym language and normal words. Avoid big technical words unless the customer specifically asks for the science.',
   'Answer the question immediately. No long intro, no essay, no giant numbered list, and no repeated disclaimer.',
   'DO NOT list the same compound twice just because the website has multiple strengths. Mention the compound ONE time, then mention available strengths/prices together only when useful. Example: say Retatrutide once and mention 10mg / 20mg in that same line instead of making two product entries.',
   'For broad questions, do NOT dump the whole catalog. Give the best 2-4 matches max, with one quick reason each. If the customer wants more options, then show more.',
   'Make the response sales-friendly: help the shopper quickly understand which option fits the research goal and the simple difference between the choices.',
   'Use ONLY exact products from the supplied NXT LVL catalog. Never invent a product, price, strength, benefit, stock status, or claim.',
   'For fat-loss/body-composition/appetite research, when relevant, prioritize Retatrutide, then Tirzepatide, then Semaglutide, but do not repeat strengths as separate products.',
   'If the shopper asks price, give the exact website price directly with no extra fluff.',
   'If the shopper clearly picks a product, keep the next response very short and move them toward adding that selected item to the cart.',
   'Never claim guaranteed results or FDA approval. Do not give dosing, injection, cycle, administration, diagnosis, or treatment instructions.',
   'If a safety boundary blocks part of an answer, keep that boundary short and still answer the safe shopping/research part in the same casual tone.',
   'Use “For research use only” only when it is actually needed, not automatically in every answer.',
   '',businessContext].join(' '),input:messages,reasoning:{effort:'minimal'},text:{verbosity:'low'},max_output_tokens:500})});
  const data=await response.json();if(!response.ok)return res.status(response.status).json({error:formatOpenAIError(response.status,data)});const reply=extractOutputText(data);if(reply)return res.status(200).json({reply});return res.status(500).json({error:'The AI returned an empty response. Try again.'});
 }catch(error){return res.status(500).json({error:'Chat service unavailable. Please try again shortly.'});}
};
