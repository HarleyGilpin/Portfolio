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

    console.log('Creating login_attempts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS login_attempts (
        ip_address TEXT PRIMARY KEY,
        attempts INTEGER DEFAULT 0,
        last_attempt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        locked_until TIMESTAMP WITH TIME ZONE
      );
    `;
    console.log('Table "login_attempts" created successfully.');

    console.log('Creating orders table...');
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        tier_name VARCHAR(255),
        price DECIMAL,
        client_name VARCHAR(255),
        client_email VARCHAR(255),
        project_details TEXT,
        deadline VARCHAR(255),
        status VARCHAR(50),
        stripe_session_id VARCHAR(255),
        agreement_content TEXT,
        hosting_tier VARCHAR(100),
        hosting_price DECIMAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table "orders" created successfully.');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

setup();
