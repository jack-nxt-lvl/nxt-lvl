const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const chat = require(path.join(root, 'api', 'chat.js'));
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const cartBridge = fs.readFileSync(path.join(root, 'ai-cart-bridge.js'), 'utf8');

test('chat voice stays concise, personal, grounded, and conversion-focused', () => {
  const prompt = chat.CHAT_INSTRUCTIONS;
  assert.match(prompt, /genuinely helpful person/i);
  assert.match(prompt, /under 70 words/i);
  assert.match(prompt, /ask exactly one easy next question/i);
  assert.match(prompt, /Never say .*not in catalog/i);
  assert.match(prompt, /Only after the shopper explicitly asks to add/i);
  assert.doesNotMatch(prompt, /prioritize Retatrutide/i);
});

test('removes accidental internal catalog narration from a model reply', () => {
  const reply = chat.cleanAssistantReply(
    'Nice. Retatrutide (not in catalog) — wait, we only use catalog. From this list, MOTS-C is available.'
  );
  assert.equal(reply, 'Nice. From what’s available, MOTS-C is available.');
  assert.doesNotMatch(reply, /catalog/i);

  assert.equal(
    chat.cleanAssistantReply('The catalog does not include that item.'),
    'I don’t see that one available right now. Want me to show you the closest current research options?'
  );
});

test('chat UI has a small research notice and useful quick starts', () => {
  assert.match(index, /For research use only/);
  assert.match(index, /Hey — what are you researching today\?/);
  assert.match(index, />Find a product</);
  assert.match(index, />Compare prices</);
  assert.match(index, />Build my cart</);
  assert.match(index, /mobile-app-upgrade\.js\?v=20260822-4/);
});

test('friendly loading copy remains compatible with AI cart actions', () => {
  assert.match(index, /pending\.dataset\.aiPending = '1'/);
  assert.match(index, /delete pending\.dataset\.aiPending/);
  assert.match(cartBridge, /el\.dataset\.aiPending === '1'/);
  assert.match(index, /ai-cart-bridge\.js\?v=20260822-4/);
  assert.match(cartBridge, /observer\.observe\(messagesRoot/);
});
