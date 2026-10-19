import { db } from './index.ts';
import { users, projectedStreams, savedVideos } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, username?: string, avatar?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        username: username || 'Gamer',
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(username ? { username } : {}),
          ...(avatar ? { avatar } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function recordProjectedStream(
  userId: number | null,
  streamUrl: string,
  title: string,
  channelName: string,
  thumbnailUrl: string,
  platform: string
) {
  try {
    const result = await db
      .insert(projectedStreams)
      .values({
        userId,
        streamUrl,
        title,
        channelName,
        thumbnailUrl,
        platform,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to record projected stream in database:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function getProjectedStreams(limitCount: number = 20) {
  try {
    return await db
      .select()
      .from(projectedStreams)
      .orderBy(desc(projectedStreams.projectedAt))
      .limit(limitCount);
  } catch (error) {
    console.error('Failed to fetch projected streams:', error);
    throw new Error('Database query failed', { cause: error });
  }
}
