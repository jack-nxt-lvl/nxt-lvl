const COOKIE = '__Host-nxt-entry=v1; Path=/; HttpOnly; Secure; SameSite=Lax';

function returnPath(value) {
  const base = 'https://entry.invalid';
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/';
  try {
    const url = new URL(value, base);
    if (url.origin !== base || url.pathname.startsWith('//')) return '/';
    return url.pathname + url.search + url.hash;
  } catch {
    return '/';
  }
}

module.exports = function visitorEntry(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  if (req.headers['sec-fetch-site'] === 'cross-site') {
    return res.status(403).send('Please confirm your eligibility on the NXT LVL Research website.');
  }
  const body = req.body || {};
  if (body.age !== 'yes' || body.research !== 'yes') {
    return res.status(403).send('Entry requires both confirmations. Go back to review your answers.');
  }

  // A native form also works without JavaScript. Its same-origin referrer retains the entry path.
  let destination = body.returnTo;
  if (!destination && req.headers.referer) {
    try {
      const referrer = new URL(req.headers.referer);
      if (referrer.host === req.headers.host && referrer.pathname.startsWith('/entry/')) {
        destination = referrer.pathname.slice('/entry'.length) + referrer.search;
      }
    } catch { /* A missing or invalid return path leads to the homepage. */ }
  }
  res.setHeader('Set-Cookie', COOKIE);
  res.setHeader('Location', returnPath(destination));
  return res.status(303).end();
};
