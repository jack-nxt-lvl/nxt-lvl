// Serve the actual page at its canonical URL, with the same consent overlay for everyone.
// No user-agent detection or crawler-only content.
const assets = '<!-- visitor-entry-assets:start --><link rel="stylesheet" href="/visitor-entry.css?v=20261116"><script src="/visitor-entry.js?v=20261116" defer></script><!-- visitor-entry-assets:end -->';
const overlay = `<!-- visitor-entry:start -->
<dialog id="nxt-entry" open aria-labelledby="nxt-entry-title" aria-describedby="nxt-entry-intro" data-nosnippet>
  <div class="nxt-entry-card" data-nosnippet>
    <p class="nxt-entry-brand">NXT LVL RESEARCH</p>
    <h2 id="nxt-entry-title">Confirm your eligibility</h2>
    <p id="nxt-entry-intro">For adults over 21 obtaining materials for laboratory research only.</p>
    <form action="/api/visitor-entry" method="post">
      <fieldset><legend>Are you over 21 years old?</legend><div class="nxt-entry-options">
        <label><input name="age" type="radio" value="yes" required> Yes</label>
        <label><input name="age" type="radio" value="no" aria-describedby="nxt-entry-denied"> No</label>
      </div></fieldset>
      <p id="nxt-entry-denied" hidden role="status">You must be over 21 to enter.</p>
      <label class="nxt-entry-research"><input name="research" type="checkbox" value="yes" required><span>Yes, I confirm that any materials I obtain here are for verified laboratory research use only.</span></label>
      <input name="returnTo" type="hidden">
      <p class="nxt-entry-error" role="alert" hidden></p>
      <button type="submit" disabled>Enter site</button>
    </form>
    <noscript><p>Enable JavaScript to confirm eligibility and enter the site.</p></noscript>
  </div>
</dialog>
<!-- visitor-entry:end -->`;
function enhance(html) {
  return html.replace(/<!-- visitor-entry-assets:start -->[\s\S]*?<!-- visitor-entry-assets:end -->/g, '')
    .replace(/<!-- visitor-entry:start -->[\s\S]*?<!-- visitor-entry:end -->\n?/g, '')
    .replace('</head>', assets + '</head>')
    .replace(/(<body\b[^>]*>)/i, '$1' + overlay + '\n');
}
module.exports = { enhance };
