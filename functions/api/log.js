// functions/api/log.js
// GET /api/log
// Vraća sve suglasnosti iz Cloudflare KV (binding: CONSENTS)
// Sortira po timestampu (novije prvo)

export async function onRequestGet(context) {
  const { env } = context;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  };

  if (!env.CONSENTS) {
    return new Response(
      JSON.stringify({ error: "KV binding CONSENTS nije konfiguriran" }),
      { status: 500, headers }
    );
  }

  // Dohvati sve ključeve s prefiksom "entry:"
  let cursor = undefined;
  const allKeys = [];

  do {
    const listResult = await env.CONSENTS.list({
      prefix: "entry:",
      cursor,
      limit: 1000,
    });

    allKeys.push(...listResult.keys);
    cursor = listResult.list_complete ? undefined : listResult.cursor;
  } while (cursor);

  // Dohvati vrijednosti paralelno (max 500 odjednom da ne preopteretimo)
  const BATCH = 500;
  const entries = [];

  for (let i = 0; i < allKeys.length; i += BATCH) {
    const batch = allKeys.slice(i, i + BATCH);
    const values = await Promise.all(
      batch.map((k) => env.CONSENTS.get(k.name, { type: "json" }))
    );
    for (const v of values) {
      if (v) entries.push(v);
    }
  }

  // Sortiraj po timestampu (novije prvo)
  entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return new Response(JSON.stringify({ entries, total: entries.length }), {
    status: 200,
    headers,
  });
}

// Preflight CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
