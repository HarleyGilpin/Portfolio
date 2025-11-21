import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function setup() {
    try {
        console.log('Creating posts table...');
        await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT,
        image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('Table "posts" created successfully.');
    } catch (error) {
        console.error('Error creating table:', error);
    }
}

setup();
