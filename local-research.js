const localInquiryForm = document.getElementById('localInquiry');
if (localInquiryForm && typeof URLSearchParams !== 'undefined') {
 const material = new URLSearchParams(window.location.search || '').get('material');
 const field = localInquiryForm.querySelector('[name="material"]');
 if (material && field) field.value = material.slice(0, 120);
}
localInquiryForm?.addEventListener('submit', function(event) {
 event.preventDefault();
 const data = new FormData(this);
 const city = String(data.get('city') || '').trim();
 if (!city) return;
 const clean = (key, limit) => String(data.get(key) || '').trim().slice(0, limit);
 const message = `Hello NXT LVL Research. I have a laboratory research fulfillment inquiry for ${city.slice(0, 80)}.\nPreferred arrangement: ${clean('method', 80)}.\nLaboratory/organization: ${clean('organization', 120) || 'To be confirmed'}.\nMaterial: ${clean('material', 120) || 'To be confirmed'}.\nRequested quantity: ${clean('quantity', 60) || 'To be confirmed'}.\nPlease confirm eligibility, availability, fees, and timing. This is an inquiry, not a confirmed order or delivery booking.`;
 const encoded = encodeURIComponent(message);
 const channel = clean('channel', 20);
 if (channel === 'sms') window.location.href = 'sms:+17542907210?body=' + encoded;
 else if (channel === 'email') window.location.href = 'mailto:payment@nxtlvl-research.com?subject=' + encodeURIComponent('South Florida research fulfillment inquiry') + '&body=' + encoded;
 else window.location.href = 'https://wa.me/17542907210?text=' + encoded;
});
