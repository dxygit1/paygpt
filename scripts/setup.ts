import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const connectionString = 'postgresql://postgres.cbkydgmhrmvhiecxkwas:Z4S38ad!cF_LdWa@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

async function setup() {
    const sql = postgres(connectionString);

    console.log('Creating tables...');

    // Create gpt_tokens table
    await sql`
    CREATE TABLE IF NOT EXISTS gpt_tokens (
      id SERIAL PRIMARY KEY,
      account_name VARCHAR(255) NOT NULL,
      session_data TEXT NOT NULL,
      access_token TEXT,
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
    console.log('✓ Created gpt_tokens table');

    // Create gpt_admins table
    await sql`
    CREATE TABLE IF NOT EXISTS gpt_admins (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
    console.log('✓ Created gpt_admins table');

    // Check if admin exists
    const existingAdmin = await sql`SELECT id FROM gpt_admins WHERE email = '960897265@qq.com'`;

    if (existingAdmin.length === 0) {
        // Create default admin
        const passwordHash = await bcrypt.hash('Ds.123456', 12);
        await sql`
      INSERT INTO gpt_admins (email, password_hash)
      VALUES ('960897265@qq.com', ${passwordHash})
    `;
        console.log('✓ Created default admin: 960897265@qq.com');
    } else {
        console.log('ℹ Admin already exists');
    }

    await sql.end();
    console.log('✓ Setup complete!');
}

setup().catch(console.error);
