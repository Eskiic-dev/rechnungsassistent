export default {
async fetch(request, env, ctx) {
const url = new URL(request.url);
const origin = request.headers.get('origin') || '';


// CORS-Header
const cors = {
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};


if (request.method === 'OPTIONS') {
return new Response(null, { headers: cors });
}


if (url.pathname === '/proxy') {
const target = url.searchParams.get('url');
if (!target) return new Response('Missing url', { status: 400, headers: cors });
try {
const res = await fetch(target, { method: 'GET' });
if (!res.ok) return new Response(`Upstream ${res.status}`, { status: 502, headers: cors });
const h = new Headers(res.headers);
// Content-Type durchreichen, CORS setzen
h.set('Access-Control-Allow-Origin', '*');
h.set('Cache-Control', 'no-store');
return new Response(res.body, { status: 200, headers: h });
} catch (e) {
return new Response('Fetch error', { status: 500, headers: cors });
}
}


return new Response('OK', { headers: cors });
}
};
