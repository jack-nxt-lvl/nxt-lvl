function smsCredentials() {
  const accountSid = String(process.env.TWILIO_ACCOUNT_SID || '');
  const authToken = String(process.env.TWILIO_AUTH_TOKEN || '');
  const messagingServiceSid = String(process.env.TWILIO_MESSAGING_SERVICE_SID || '');
  const from = String(process.env.TWILIO_FROM_NUMBER || '');
  if (!/^AC[a-fA-F0-9]{32}$/.test(accountSid) || !authToken || (!messagingServiceSid && !from)) {
    throw new Error('SMS delivery is not configured.');
  }
  return { accountSid, authToken, messagingServiceSid, from };
}

function normalizePhone(value) {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+') && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  throw new Error('Enter a valid mobile number, including the country code if outside the US.');
}

function smsConfigured() {
  try { smsCredentials(); return true; } catch (_) { return false; }
}

async function sendSms({ to, body }) {
  const { accountSid, authToken, messagingServiceSid, from } = smsCredentials();
  const params = new URLSearchParams({ To: normalizePhone(to), Body: String(body || '').slice(0, 1500) });
  if (messagingServiceSid) params.set('MessagingServiceSid', messagingServiceSid);
  else params.set('From', from);
  if (messagingServiceSid && process.env.TWILIO_SHORTEN_URLS === 'true') params.set('ShortenUrls', 'true');

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: params.toString(),
    signal: AbortSignal.timeout(10_000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Unable to send the payment text.');
  return { sid: data.sid || null, to: data.to || normalizePhone(to) };
}

module.exports = { normalizePhone, sendSms, smsConfigured, smsCredentials };
