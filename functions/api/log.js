export async function onRequestGet(context) {
  const { env } = context;
  const entries = (await env.CONSENTS.get('log', 'json')) || [];
  return new Response(JSON.stringify(entries), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
