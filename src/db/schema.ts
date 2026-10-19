import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  username: text('username'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'projected_streams' table
export const projectedStreams = pgTable('projected_streams', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  streamUrl: text('stream_url').notNull(),
  title: text('title').notNull(),
  channelName: text('channel_name').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  platform: text('platform').notNull(), // 'youtube' or 'twitch'
  projectedAt: timestamp('projected_at').defaultNow(),
});

// Define the 'saved_videos' table
export const savedVideos = pgTable('saved_videos', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  videoId: text('video_id').notNull(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  thumbnail: text('thumbnail').notNull(),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  projectedStreams: many(projectedStreams),
  savedVideos: many(savedVideos),
}));

export const projectedStreamsRelations = relations(projectedStreams, ({ one }) => ({
  user: one(users, {
    fields: [projectedStreams.userId],
    references: [users.id],
  }),
}));

export const savedVideosRelations = relations(savedVideos, ({ one }) => ({
  user: one(users, {
    fields: [savedVideos.userId],
    references: [users.id],
  }),
}));
