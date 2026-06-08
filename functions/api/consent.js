export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const name = (body.name || '').trim().slice(0, 120);
  if (!name) return jsonResponse({ error: 'Ime je obavezno' }, 400);

  const existing = (await env.CONSENTS.get('log', 'json')) || [];
  existing.push({ name, timestamp: new Date().toISOString() });
  await env.CONSENTS.put('log', JSON.stringify(existing));

  return jsonResponse({ ok: true });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
