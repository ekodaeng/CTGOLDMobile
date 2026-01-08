interface SessionPayload {
  email: string;
  role: 'admin' | 'super_admin';
  user_id: string;
  iat: number;
  exp: number;
}

const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

function getSessionSecret(): string {
  const secret = Deno.env.get('ADMIN_SESSION_SECRET');
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters');
  }
  return secret;
}

async function hmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export async function signSession(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
  const now = Date.now();
  const fullPayload: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + SESSION_DURATION_MS,
  };

  const payloadJson = JSON.stringify(fullPayload);
  const payloadBase64 = btoa(payloadJson);

  const secret = getSessionSecret();
  const signature = await hmacSha256(payloadBase64, secret);

  return `${payloadBase64}.${signature}`;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [payloadBase64, signature] = parts;

    const secret = getSessionSecret();
    const expectedSignature = await hmacSha256(payloadBase64, secret);

    if (signature !== expectedSignature) {
      return null;
    }

    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}