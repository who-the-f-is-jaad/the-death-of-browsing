import { kv } from '@vercel/kv';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'tdb-session';
export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const TOKEN_TTL = 60 * 15; // 15 minutes

export interface User {
  id: string;
  email: string;
  createdAt: string;
  username?: string;
  displayName?: string;
}

export interface Session {
  userId: string;
  email: string;
}

export async function generateMagicToken(email: string): Promise<string> {
  const token = crypto.randomUUID();
  await kv.set(`tdb:auth:${token}`, { email }, { ex: TOKEN_TTL });
  return token;
}

export async function verifyMagicToken(token: string): Promise<string | null> {
  const data = await kv.get<{ email: string }>(`tdb:auth:${token}`);
  if (!data) return null;
  await kv.del(`tdb:auth:${token}`);
  return data.email;
}

export async function ensureUser(email: string): Promise<User> {
  const key = `tdb:user:${email}`;
  const existing = await kv.get<User>(key);
  if (existing) {
    // Backfill reverse index for existing users on next login
    await kv.set(`tdb:userid:${existing.id}`, existing, { nx: true });
    return existing;
  }
  const user: User = {
    id: crypto.randomUUID(),
    email,
    createdAt: new Date().toISOString(),
  };
  await Promise.all([
    kv.set(key, user),
    kv.set(`tdb:userid:${user.id}`, user),
  ]);
  return user;
}

export async function getUserById(userId: string): Promise<User | null> {
  return kv.get<User>(`tdb:userid:${userId}`);
}

export async function getUserByUsername(handle: string): Promise<User | null> {
  const userId = await kv.get<string>(`tdb:username:${handle.toLowerCase()}`);
  if (!userId) return null;
  return getUserById(userId);
}

export async function updateUser(
  email: string,
  updates: Partial<Pick<User, 'username' | 'displayName'>>,
): Promise<User | null> {
  const key = `tdb:user:${email}`;
  const existing = await kv.get<User>(key);
  if (!existing) return null;
  const updated: User = { ...existing, ...updates };
  await Promise.all([
    kv.set(key, updated),
    kv.set(`tdb:userid:${existing.id}`, updated),
  ]);
  return updated;
}

export async function createSession(email: string): Promise<string> {
  const user = await ensureUser(email);
  const sessionId = crypto.randomUUID();
  await kv.set(`tdb:session:${sessionId}`, { userId: user.id, email: user.email }, { ex: SESSION_MAX_AGE });
  return sessionId;
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionId) return null;
    return await kv.get<Session>(`tdb:session:${sessionId}`);
  } catch {
    return null;
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  await kv.del(`tdb:session:${sessionId}`);
}
