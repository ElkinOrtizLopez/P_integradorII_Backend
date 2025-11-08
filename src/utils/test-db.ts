import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa a PostgreSQL:', result.rows[0]);
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
