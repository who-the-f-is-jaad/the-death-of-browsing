import { kv } from '@vercel/kv';

const RESERVED_USERNAMES = new Set(['me', 'record', 'search', 'admin', 'api', 'u', 'about', 'contact', 'archive', 'practice', 'profile', 'deathmatch', 'invite']);

export function isValidUsername(handle: string): boolean {
  if (RESERVED_USERNAMES.has(handle)) return false;
  return /^[a-z0-9_]{3,20}$/.test(handle);
}

// Claim a new username — returns false if already taken
export async function claimUsername(
  userId: string,
  handle: string,
): Promise<boolean> {
  const key = `tdb:username:${handle}`;
  // SET NX — only writes if key doesn't exist
  const result = await kv.set(key, userId, { nx: true });
  if (!result) return false;
  // Add to lexicographic search index: member = "handle:userId", score = 0
  await kv.zadd('tdb:username-index', { score: 0, member: `${handle}:${userId}` });
  return true;
}

// Release a username (e.g. when user changes handle)
export async function releaseUsername(oldHandle: string, userId: string): Promise<void> {
  await Promise.all([
    kv.del(`tdb:username:${oldHandle}`),
    kv.zrem('tdb:username-index', `${oldHandle}:${userId}`),
  ]);
}

// Follow a user
export async function followUser(followerId: string, followedId: string): Promise<void> {
  const score = Date.now();
  await Promise.all([
    kv.zadd(`tdb:following:${followerId}`, { score, member: followedId }),
    kv.zadd(`tdb:followers:${followedId}`, { score, member: followerId }),
  ]);
}

// Unfollow a user
export async function unfollowUser(followerId: string, followedId: string): Promise<void> {
  await Promise.all([
    kv.zrem(`tdb:following:${followerId}`, followedId),
    kv.zrem(`tdb:followers:${followedId}`, followerId),
  ]);
}

// Check if followerId is following followedId
export async function isFollowing(followerId: string, followedId: string): Promise<boolean> {
  const score = await kv.zscore(`tdb:following:${followerId}`, followedId);
  return score !== null;
}

export async function getFollowerCount(userId: string): Promise<number> {
  return (await kv.zcard(`tdb:followers:${userId}`)) ?? 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
  return (await kv.zcard(`tdb:following:${userId}`)) ?? 0;
}

// Returns list of userIds (most recent first)
export async function getFollowers(userId: string, limit = 20): Promise<string[]> {
  const members = await kv.zrange(`tdb:followers:${userId}`, 0, limit - 1, { rev: true });
  return (members ?? []) as string[];
}

export async function getFollowing(userId: string, limit = 20): Promise<string[]> {
  const members = await kv.zrange(`tdb:following:${userId}`, 0, limit - 1, { rev: true });
  return (members ?? []) as string[];
}

// Prefix search by username
export async function searchUsersByPrefix(
  prefix: string,
  limit = 10,
): Promise<Array<{ username: string; userId: string }>> {
  if (!prefix || prefix.length < 1) return [];
  const lower = prefix.toLowerCase();
  const members = (await kv.zrange(
    'tdb:username-index',
    `[${lower}`,
    `[${lower}\xff`,
    { byLex: true },
  )) as string[];

  return (members ?? []).slice(0, limit).map(m => {
    const colonIdx = m.indexOf(':');
    return { username: m.slice(0, colonIdx), userId: m.slice(colonIdx + 1) };
  });
}

// Record that two users played deathmatch together (for follow suggestions)
export async function recordPlayedWith(userIds: string[]): Promise<void> {
  await Promise.all(
    userIds.flatMap(userId =>
      userIds
        .filter(id => id !== userId)
        .map(otherId => kv.sadd(`tdb:played-with:${userId}`, otherId)),
    ),
  );
}

export async function getPlayedWith(userId: string): Promise<string[]> {
  return ((await kv.smembers(`tdb:played-with:${userId}`)) ?? []) as string[];
}

// --- Friend system ---

const frqIn  = (id: string) => `tdb:friend-req:in:${id}`;
const frqOut = (id: string) => `tdb:friend-req:out:${id}`;
const frKey  = (id: string) => `tdb:friends:${id}`;

export async function getFriendStatus(
  viewerId: string,
  targetId: string,
): Promise<'none' | 'friends' | 'sent' | 'incoming'> {
  const [friendScore, sentScore, incomingScore] = await Promise.all([
    kv.zscore(frKey(viewerId), targetId),
    kv.zscore(frqOut(viewerId), targetId),
    kv.zscore(frqIn(viewerId), targetId),
  ]);
  if (friendScore !== null) return 'friends';
  if (sentScore !== null) return 'sent';
  if (incomingScore !== null) return 'incoming';
  return 'none';
}

export async function sendFriendRequest(
  senderId: string,
  receiverId: string,
): Promise<'ok' | 'already_friends' | 'already_sent' | 'self'> {
  if (senderId === receiverId) return 'self';
  const [friendScore, sentScore] = await Promise.all([
    kv.zscore(frKey(senderId), receiverId),
    kv.zscore(frqOut(senderId), receiverId),
  ]);
  if (friendScore !== null) return 'already_friends';
  if (sentScore !== null) return 'already_sent';
  const score = Date.now();
  await Promise.all([
    kv.zadd(frqOut(senderId), { score, member: receiverId }),
    kv.zadd(frqIn(receiverId), { score, member: senderId }),
  ]);
  return 'ok';
}

export async function cancelFriendRequest(senderId: string, receiverId: string): Promise<void> {
  await Promise.all([
    kv.zrem(frqOut(senderId), receiverId),
    kv.zrem(frqIn(receiverId), senderId),
  ]);
}

export async function acceptFriendRequest(receiverId: string, senderId: string): Promise<void> {
  const score = Date.now();
  await Promise.all([
    kv.zrem(frqIn(receiverId), senderId),
    kv.zrem(frqOut(senderId), receiverId),
    kv.zadd(frKey(receiverId), { score, member: senderId }),
    kv.zadd(frKey(senderId), { score, member: receiverId }),
  ]);
}

export async function rejectFriendRequest(receiverId: string, senderId: string): Promise<void> {
  await Promise.all([
    kv.zrem(frqIn(receiverId), senderId),
    kv.zrem(frqOut(senderId), receiverId),
  ]);
}

export async function unfriend(userId1: string, userId2: string): Promise<void> {
  await Promise.all([
    kv.zrem(frKey(userId1), userId2),
    kv.zrem(frKey(userId2), userId1),
  ]);
}

export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
  return (await kv.zscore(frKey(userId1), userId2)) !== null;
}

export async function getFriends(userId: string, limit = 50): Promise<string[]> {
  const members = await kv.zrange(frKey(userId), 0, limit - 1, { rev: true });
  return (members ?? []) as string[];
}

export async function getFriendCount(userId: string): Promise<number> {
  return (await kv.zcard(frKey(userId))) ?? 0;
}

export async function getIncomingRequests(userId: string): Promise<string[]> {
  const members = await kv.zrange(frqIn(userId), 0, 99, { rev: true });
  return (members ?? []) as string[];
}

export async function getOutgoingRequests(userId: string): Promise<string[]> {
  const members = await kv.zrange(frqOut(userId), 0, 99, { rev: true });
  return (members ?? []) as string[];
}
