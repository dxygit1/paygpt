import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL ||
    'postgresql://postgres.cbkydgmhrmvhiecxkwas:Z4S38ad!cF_LdWa@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

// For migrations and seeding
export const migrationClient = postgres(connectionString, { max: 1 });

// For queries
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });
