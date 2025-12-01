// src/routes/map/missions/+server.ts
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const GATEWAY_BASE = env.MISSION_SERVICE_URL ?? 'http://api-gateway:3000';

export const GET: RequestHandler = async () => {
  try {
    const res = await fetch(`${GATEWAY_BASE}/map/missions`);

    if (!res.ok) {
      const text = await res.text();
      console.error('Backend error from api-gateway:', res.status, text);
      return new Response(text, { status: res.status });
    }

    const text = await res.text();
    return new Response(text, {
      status: 200,
      headers: {
        'content-type': 'application/json'
      }
    });
  } catch (err: unknown) {
    console.error('Proxy fetch failed:', err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ message: 'Mission proxy failed', error: message }),
      { status: 502 }
    );
  }
};
