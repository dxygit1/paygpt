import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

// GPT Tokens table - stores user submitted session data
export const gptTokens = pgTable('gpt_tokens', {
  id: serial('id').primaryKey(),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  sessionData: text('session_data').notNull(), // Complete JSON, stored as-is
  accessToken: text('access_token'), // Extracted accessToken for quick reference
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// GPT Admins table - admin accounts
export const gptAdmins = pgTable('gpt_admins', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
