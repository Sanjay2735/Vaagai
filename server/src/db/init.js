import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testConnection } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase() {
  console.log('--- Initializing Vaagai PostgreSQL Database ---');

  const connection = await testConnection();
  if (!connection.ok) {
    console.error('❌ Database connection error:');
    console.error(connection.message);
    console.error('\nPlease verify your DATABASE_URL in server/.env:');
    console.error('Example: postgresql://postgres:postgres@localhost:5432/vaagai_db');
    console.error('Or cloud: postgresql://[user]:[password]@[host]/[db]?sslmode=require\n');
    throw new Error(connection.message);
  }

  console.log(`✓ ${connection.message}`);

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(schemaSql);
    console.log('✓ Successfully created all database tables, constraints, and indexes.');
    return true;
  } catch (error) {
    console.error('❌ Error executing schema SQL:', error.message);
    throw error;
  }
}

// Allow direct CLI execution: node src/db/init.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initDatabase()
    .then(() => {
      console.log('✅ Database initialization complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Initialization failed:', err.message);
      process.exit(1);
    });
}
