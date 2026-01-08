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

export function getSessionCookieName(): string {
  return Deno.env.get('ADMIN_SESSION_COOKIE_NAME') || 'ctgold_admin_session';
}

export function createSessionCookie(token: string): string {
  const cookieName = getSessionCookieName();
  const maxAge = Math.floor(SESSION_DURATION_MS / 1000);
  return `${cookieName}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  const cookieName = getSessionCookieName();
  return `${cookieName}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function extractSessionFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookieName = getSessionCookieName();
  const cookies = cookieHeader.split(';').map(c => c.trim());

  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === cookieName && value) {
      return value;
    }
  }

  return null;
}
