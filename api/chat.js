const DEFAULT_MODEL = 'gpt-5-nano';
const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 900;

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
          'You are the NXT LVL website assistant.',
          'Help visitors with product navigation, pricing tiers, cart questions, shipping/order flow, and general research-use-only site information.',
          'Do not provide medical advice, dosing advice for human use, treatment guidance, legality claims, or safety assurances.',
          'If asked about medical use, human consumption, diagnosis, treatment, injections, or dosing, remind the user that products are for laboratory research use only and direct them to a qualified professional.',
          'Keep replies concise and practical.',
        ].join(' '),
        input: messages,
        max_output_tokens: 450,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error && data.error.message ? data.error.message : 'OpenAI request failed.',
      });
    }

    const reply = extractOutputText(data);
    return res.status(200).json({ reply: reply || 'I could not generate a response. Please try again.' });
  } catch (error) {
    return res.status(500).json({ error: 'Chat service unavailable. Please try again shortly.' });
  }
};
