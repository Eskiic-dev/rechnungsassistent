// Einfache Heuristiken/Regex für DE/AT-Rechnungen
export function parseInvoiceText(text) {
const clean = (s) => s?.replace(/\s+/g, ' ').trim() || null;


const totalMatch = text.match(/\b(Gesamt|Endsumme|Brutto)\s*[:\-]?\s*([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+\.[0-9]{2})/i);
const netMatch = text.match(/\b(Netto|Zwischensumme)\s*[:\-]?\s*([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+\.[0-9]{2})/i);
const vatMatch = text.match(/\b(MwSt|MwSt\.|USt|USt\.)\s*(?:Satz|\%)?\s*[:\-]?\s*(\d{1,2}(?:[\.,]\d{1,2})?)\s*%?/i);
const vatAmt = text.match(/\b(MwSt|USt).*?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+\.[0-9]{2})/i);


const dateMatch = text.match(/\b(Rechnungsdatum|Datum)\s*[:\-]?\s*(\d{2}[\./]\d{2}[\./]\d{4}|\d{4}-\d{2}-\d{2})/i);
const dueMatch = text.match(/\b(Fälligkeit|Fällig am|zahlbar bis|Zahlungsziel)\s*[:\-]?\s*(\d{2}[\./]\d{2}[\./]\d{4}|\d{4}-\d{2}-\d{2})/i);


const ibanMatch = text.match(/\b[A-Z]{2}\d{2}\s?(?:[A-Z0-9]{4}\s?){2,7}[A-Z0-9]{1,}/);
const refMatch = text.match(/\b(RF\d{2}[A-Z0-9]+|Zahlungsreferenz|Verwendungszweck)\s*[:\-]?\s*([A-Z0-9\- ]{6,})/i);


const invNoMatch = text.match(/\b(Rechnungsnr\.|Rechnungsnummer|Invoice\s*No\.)\s*[:\-]?\s*([A-Z0-9\-\/]{3,})/i);
const sellerMatch= text.match(/\b(Firma|Unternehmen|Aussteller|Supplier)\s*[:\-]?\s*([\p{L}0-9 ,\.&\-]{3,})/iu);
const custMatch = text.match(/\b(Kunde|Empfänger|Customer)\s*[:\-]?\s*([\p{L}0-9 ,\.&\-]{3,})/iu);


const toNumber = (s) => {
if (!s) return null;
const n = s.replace(/\./g, '').replace(',', '.');
const f = parseFloat(n);
return Number.isFinite(f) ? f : null;
};


const data = {
rechnungsnummer: clean(invNoMatch?.[2]),
aussteller: clean(sellerMatch?.[2]),
empfaenger: clean(custMatch?.[2]),
datum: clean(dateMatch?.[2]),
faellig: clean(dueMatch?.[2]),
mwst_satz: vatMatch ? parseFloat(vatMatch[1].replace(',', '.')) : null,
mwst_betrag: toNumber(vatAmt?.[2]),
gesamt_betrag: toNumber(totalMatch?.[2]) ?? toNumber(netMatch?.[2]),
iban: clean(ibanMatch?.[0])?.replace(/\s+/g, ' ') || null,
referenz: clean(refMatch?.[2])
};


return data;
}


export function generateExplanation(inv) {
const parts = [];
if (inv.gesamt_betrag) parts.push(`Der Gesamtbetrag beträgt ${inv.gesamt_betrag.toFixed(2)} Euro.`);
if (inv.faellig) parts.push(`Die Rechnung ist fällig am ${inv.faellig}.`);
if (inv.iban) parts.push(`Die Zahlung kann an die IBAN ${inv.iban} erfolgen.`);
if (inv.referenz) parts.push(`Bitte gib als Referenz: ${inv.referenz} an.`);
if (parts.length === 0) parts.push("Ich konnte die wichtigsten Felder noch nicht sicher erkennen. Du kannst mir Fragen stellen, oder die Datei manuell hochladen.");
return parts.join(' ');
}
