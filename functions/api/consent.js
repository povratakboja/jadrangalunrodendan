// functions/api/consent.js
// POST /api/consent
// Sprema suglasnost (ime + timestamp) u Cloudflare KV (binding: CONSENTS)
// KV key: "entry:<timestamp_ms>:<random>" → JSON vrijednost s imenom i vremenom

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headeri
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  // Provjeri KV binding
  if (!env.CONSENTS) {
    return new Response(
      JSON.stringify({ error: "KV binding CONSENTS nije konfiguriran" }),
      { status: 500, headers }
    );
  }

  // Parsiraj body
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Neispravan JSON" }),
      { status: 400, headers }
    );
  }

  const name = (body.name || "").trim();
  if (!name) {
    return new Response(
      JSON.stringify({ error: "Ime je obavezno" }),
      { status: 400, headers }
    );
  }

  // Kreiraj zapis
  const timestamp = new Date().toISOString();
  const ms = Date.now();
  const rand = Math.random().toString(36).slice(2, 7);
  const key = `entry:${ms}:${rand}`;

  const entry = { name, timestamp };

  // Spremi u KV (TTL: 180 dana)
  await env.CONSENTS.put(key, JSON.stringify(entry), {
    expirationTtl: 60 * 60 * 24 * 180,
  });

  return new Response(
    JSON.stringify({ ok: true, key, entry }),
    { status: 201, headers }
  );
}

// Preflight CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
