import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';

// Exporting the Drizzle DB instance using Vercel Postgres client
export const db = drizzle(sql, { schema });
