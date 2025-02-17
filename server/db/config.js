import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  user: 'postgres',
  password: '1331',
  host: 'localhost',
  port: 5432,
  database: 'nepal_disaster_response'
});