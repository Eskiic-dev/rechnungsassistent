// Minimal-Frontend: QR-Scan, PDF laden, Text mit pdf.js extrahieren, parsen & TTS
import { BrowserMultiFormatReader } from "https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/+esm";
import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs";
import { parseInvoiceText, generateExplanation } from "./parser.js";


// ===== Konfiguration =====
// Basis-URL deines Cloudflare Workers (ohne Slash am Ende), z. B. "https://rechnungs-proxy.DEIN.workers.dev"
const WORKER_BASE = null;
const USE_GEMINI = !!WORKER_BASE; // Chat nur aktiv, wenn Worker gesetzt ist


// Optional: reiner Proxy gegen CORS-Probleme (nutzt denselben Worker)
const PROXY_URL = WORKER_BASE; // wenn gesetzt, wird /proxy genutzt


pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


const els = {
start: document.getElementById('startScan'),
stop: document.getElementById('stopScan'),
video: document.getElementById('video'),
status: document.getElementById('scanStatus'),
file: document.getElementById('pdfFile'),
invoiceJson: document.getElementById('invoiceJson'),
question: document.getElementById('question'),
askBtn: document.getElementById('askBtn'),
speakBtn: document.getElementById('speakBtn'),
answer: document.getElementById('answer')
};


let codeReader;
let lastInvoice = null;
let stopFn = null;


function speak(text) {
try {
const u = new SpeechSynthesisUtterance(text);
u.lang = 'de-DE';
window.speechSynthesis.cancel();
window.speechSynthesis.speak(u);
} catch (e) { console.warn('TTS nicht verfügbar', e); }
}


async function startScan() {
els.status.textContent = 'Kamera wird gestartet…';
els.start.disabled = true; els.stop.disabled = false;


codeReader = new BrowserMultiFormatReader();
const devices = await navigator.mediaDevices.enumerateDevices();
const cams = devices.filter(d => d.kind === 'videoinput');
const backCam = cams[cams.length - 1];


});
