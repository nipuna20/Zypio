const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Create a PostgreSQL connection pool using the DATABASE_URL from the environment.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};