import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Load environment variables from .env file
config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the connection
const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

// Create the drizzle instance
export const db = drizzle(sql, { schema });

// Export the sql connection for raw queries if needed
export { sql }; 