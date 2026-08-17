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
  'The current checkout button is not connected to a live payment processor yet.',
  'Orders are handled directly through WhatsApp while payment processing is not connected.',
  'WhatsApp order link: https://wa.me/17542907210.',
  'Order phone number shown on the site: +1 (754) 290-7210.',
  'The site says final pricing, payment, availability, and shipping are confirmed at checkout or direct order.',
  'The site mentions a crypto discount may be available; customers should ask for details.',
  'The assistant should help users find products, compare listed categories, explain listed product page descriptions, answer pricing-tier questions, explain the cart/order flow, and point users to WhatsApp for direct ordering.',
].join('\n');

let cachedCatalog = null;

function loadCatalog() {
  if (cachedCatalog) return cachedCatalog;

  try {
    const source = fs.readFileSync(path.join(process.cwd(), 'products-data.js'), 'utf8');
    cachedCatalog = vm.runInNewContext(`${source}\n({ compounds, categories, protocols, stacks });`, {});
  } catch (error) {
    cachedCatalog = { compounds: [], categories: [], protocols: [], stacks: [] };
  }

  return cachedCatalog;
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, ' ')
    .trim();
}

function scoreProduct(product, question) {
  const haystack = normalizeText([
    product.id,
    product.name,
    product.aka,
    product.category,
    product.shortDesc,
    product.description,
    product.benefits && product.benefits.join(' '),
    product.tags && product.tags.join(' '),
  ].join(' '));

  return normalizeText(question)
    .split(/\s+/)
    .filter((term) => term.length >= 3)
    .reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function formatProduct(product, categories) {
  const category = categories.find((item) => item.id === product.category);
  const prices = (product.pricing || [])
    .map((price) => `${price.label}: $${Number(price.price).toFixed(2)}`)
    .join(', ');

  return [
    `Name: ${product.name}`,
    `AKA: ${product.aka || 'N/A'}`,
    `Category: ${category ? category.name : product.category}`,
    `Tags: ${(product.tags || []).join(', ')}`,
    `Short description: ${product.shortDesc || ''}`,
    `Product description: ${product.description || ''}`,
    `Listed research notes: ${(product.benefits || []).join('; ')}`,
    `Pricing: ${prices}`,
    `Important warning: ${product.warnings || 'Research use only; not for human consumption.'}`,
  ].join('\n');
}

function formatProductSummary(product, categories) {
  const category = categories.find((item) => item.id === product.category);
  const prices = (product.pricing || [])
    .map((price) => `${price.label} $${Number(price.price).toFixed(2)}`)
    .join('; ');

  return `${product.name} (${product.aka || 'N/A'}) | ${category ? category.name : product.category} | ${product.shortDesc || ''} | Prices: ${prices}`;
}

function formatStack(stack) {
  return [
    `${stack.name}: ${stack.goal}`,
    `Products: ${(stack.compounds || []).map((compound) => `${compound.name} (${compound.role})`).join(', ')}`,
    `Duration listed: ${stack.duration || 'N/A'}`,
  ].join(' ');
}

function buildBusinessContext(messages) {
  const latestQuestion = messages.length ? messages[messages.length - 1].content : '';
  const catalog = loadCatalog();
  const products = catalog.compounds || [];
  const categories = catalog.categories || [];
  const protocols = catalog.protocols || [];
  const stacks = catalog.stacks || [];

  const matchedProducts = products
    .map((product) => ({ product, score: scoreProduct(product, latestQuestion) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_MATCHED_PRODUCTS)
    .map((item) => item.product);

  const fallbackProducts = matchedProducts.length ? matchedProducts : products.slice(0, 3);

  return [
    'NXT LVL business and catalog context. Use only this context for business and product-specific answers.',
    '',
    'Business facts:',
    BUSINESS_FACTS,
    '',
    `Categories: ${categories.map((category) => category.name).join(', ')}`,
    `Protocols: ${protocols.map((protocol) => `${protocol.name} - ${protocol.description}`).join(' | ')}`,
    `Curated stacks: ${stacks.map(formatStack).join(' | ')}`,
    '',
    'Catalog summary:',
    products.slice(0, MAX_CATALOG_SUMMARY_ITEMS).map((product) => formatProductSummary(product, categories)).join('\n'),
    '',
    'Detailed context for the most relevant products:',
    fallbackProducts.map((product) => formatProduct(product, categories)).join('\n\n---\n\n'),
  ].join('\n');
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message && message.role === 'assistant' ? 'assistant' : 'user',
      content: String((message && message.content) || '').slice(0, MAX_MESSAGE_LENGTH).trim(),
    }))
    .filter((message) => message.content);
}

function extractOutputText(data) {
  if (typeof data.output_text === 'string') return data.output_text;

  if (Array.isArray(data.output)) {
    return data.output
      .flatMap((item) => item.content || [])
      .map((part) => part.text || '')
      .join('')
      .trim();
  }

  return '';
}

function formatOpenAIError(status, data) {
  const error = data && data.error ? data.error : {};
  const code = error.code || error.type || '';
  const message = error.message || 'OpenAI request failed.';

  if (status === 429) {
    if (code.includes('spend_limit')) {
      return 'OpenAI spend limit reached. Check the project or organization spend limit in OpenAI.';
    }
    if (code.includes('usage_limit') || code.includes('insufficient_quota')) {
      return 'OpenAI billing or credits are not active yet. Add payment details or credits in OpenAI, then try again.';
    }
    return 'OpenAI rate limit reached. Wait a minute and try again, or check rate limits for the selected model.';
  }

  if (status === 404 || code.includes('model')) {
    return 'OpenAI model is not available for this project. Confirm OPENAI_MODEL in Vercel matches an allowed OpenAI model.';
  }

  return message;
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' });
  }

  const messages = normalizeMessages(req.body && req.body.messages);
  if (!messages.length) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const businessContext = buildBusinessContext(messages);

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        instructions: [
          'You are the NXT LVL Assistant.',
          'Your job is to give customers fast, clear, direct answers.',
          'Response rules: Answer the customer question immediately. Keep responses short, usually 1-3 sentences. Give the answer first. Do not start with background information. Do not give unnecessary context, explanations, or long introductions. Do not repeat information the customer did not ask for. Never dump large lists of products. If several options exist, mention only the 2-3 most relevant. Use simple, conversational language. Avoid robotic phrases such as "If you are exploring" or "It is important to note." Do not repeat the same disclaimer multiple times. Do not turn a simple question into a long educational response. Only explain something in detail if the customer specifically asks for more information. Ask at most one follow-up question at a time. If you do not know something, say so briefly instead of guessing.',
          'Style: Sound like a knowledgeable, efficient human representative. Default behavior: answer first, keep it short, then stop.',
          'Answer business questions about NXT LVL, including the website, catalog, products listed on the site, product categories, product page descriptions, pricing tiers, cart questions, order flow, WhatsApp ordering, shipping/contact info, crypto-discount note, research-use-only policy, and simple unit conversions related to listed product amounts.',
          'For product-effect questions like "What does BPC-157 help with?", answer from the catalog context using phrases like "NXT LVL lists this as studied for..." or "The product page describes..."',
          'If a user asks what the business sells, summarize the categories and give examples from the catalog summary.',
          'If a user asks how to buy, explain the cart can collect items, checkout is not connected to a live payment processor yet, and direct orders are handled through WhatsApp.',
          'Do not present products as treatments, cures, prescriptions, or recommendations for human use.',
          'Do not provide dosing protocols, injection instructions, administration instructions, medical advice, side-effect management, legal advice, safety assurances, or instructions for human consumption.',
          'For questions involving personal use of research-only compounds, do not prescribe, provide dosing instructions, or tell the customer which research compound they personally should take. Give a brief factual answer and redirect to appropriate general information.',
          'If asked about medical use, human consumption, diagnosis, treatment, injections, administration, or dosing, briefly remind the user that products are for laboratory research use only and direct them to a qualified professional.',
          'For unrelated questions, briefly say you can only help with NXT LVL catalog, cart, pricing, ordering, and research-use-only product information.',
          '',
          businessContext,
        ].join(' '),
        input: messages,
        reasoning: { effort: 'low' },
        max_output_tokens: 350,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: formatOpenAIError(response.status, data),
      });
    }

    const reply = extractOutputText(data);
    if (reply) return res.status(200).json({ reply });

    if (data.status === 'incomplete') {
      return res.status(500).json({
        error: 'The AI ran out of response tokens before producing text. Try again or raise max_output_tokens.',
      });
    }

    return res.status(500).json({ error: 'The AI returned an empty response. Try again.' });
  } catch (error) {
    return res.status(500).json({ error: 'Chat service unavailable. Please try again shortly.' });
  }
};
