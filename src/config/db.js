import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                      
  idleTimeoutMillis: 30000,     
  connectionTimeoutMillis: 5000 
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(1);
});

pool.query('SELECT 1')
  .then(() => console.log('PostgreSQL connected'))
  .catch((err) => {
    console.error('PostgreSQL connection failed:', err.message);
    process.exit(1);
  });

export default pool;