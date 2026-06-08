export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/consent' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return jsonRes({ error: 'Invalid JSON' }, 400); }
      const name = (body.name || '').trim().slice(0, 120);
      if (!name) return jsonRes({ error: 'Ime je obavezno' }, 400);
      const existing = (await env.CONSENTS.get('log', { type: 'json' })) || [];
      existing.push({ name, timestamp: new Date().toISOString() });
      await env.CONSENTS.put('log', JSON.stringify(existing));
      return jsonRes({ ok: true });
    }

    if (url.pathname === '/api/log' && request.method === 'GET') {
      const entries = (await env.CONSENTS.get('log', { type: 'json' })) || [];
      return jsonRes(entries);
    }

    return env.ASSETS.fetch(request);
  }
};

function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
