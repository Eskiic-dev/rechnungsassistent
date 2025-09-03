// Minimal-Frontend: QR-Scan, PDF laden, Text mit pdf.js extrahieren, parsen & TTS
async (res, err) => {
if (res) {
const url = res.getText();
els.status.textContent = `QR erkannt: ${url}`;
speak('Ich habe einen Rechnungslink gefunden.');
await handleInvoiceUrl(url);
stopScan();
}
}
);
}


function stopScan() {
if (stopFn) stopFn();
els.start.disabled = false; els.stop.disabled = true;
els.status.textContent = 'Scanner gestoppt.';
}


async function handleInvoiceUrl(url) {
try {
const fetched = await fetchPdf(url);
const text = await extractPdfText(fetched);
await processText(text);
} catch (e) {
console.error(e);
els.status.textContent = 'Konnte PDF nicht laden (CORS?). Bitte Datei-Upload nutzen.';
}
}


async function fetchPdf(url) {
const target = PROXY_URL ? `${PROXY_URL}/proxy?url=${encodeURIComponent(url)}` : url;
const res = await fetch(target);
if (!res.ok) throw new Error(`Fetch fehlgeschlagen: ${res.status}`);
const buf = await res.arrayBuffer();
return new Uint8Array(buf);
}


async function extractPdfText(pdfBytes) {
const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
const pdf = await loadingTask.promise;
let text = '';
for (let i = 1; i <= pdf.numPages; i++) {
const page = await pdf.getPage(i);
const c = await page.getTextContent();
const t = c.items.map(it => it.str).join(' ');
text += `\n${t}`;
}
return text;
}


async function processText(text) {
const inv = parseInvoiceText(text);
lastInvoice = inv;
els.invoiceJson.textContent = JSON.stringify(inv, null, 2);
const expl = generateExplanation(inv);
els.answer.textContent = expl;
speak(expl);
}


// Datei-Upload (PDF oder Bild)
els.file.addEventListener('change', async (e) => {
const file = e.target.files?.[0];
if (!file) return;
els.status.textContent = `Datei: ${file.name}`;


});
