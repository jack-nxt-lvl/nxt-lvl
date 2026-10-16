document.getElementById('localInquiry')?.addEventListener('submit', function(event) {
 event.preventDefault();
 const data = new FormData(this);
 const city = String(data.get('city') || '').trim();
 if (!city) return;
 const message = `Hello NXT LVL Research. I have a laboratory research fulfillment inquiry for ${city}. Preferred arrangement: ${data.get('method')}. Please confirm eligibility, availability, fees, and timing. Laboratory/organization: __. Material and quantity: __.`;
 window.location.href = 'https://wa.me/17542907210?text=' + encodeURIComponent(message);
});
