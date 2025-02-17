import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { incidentRouter } from './routes/incident.js';
import { pool } from './db/config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/incidents', incidentRouter);

// Initialize database tables
async function initDb() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Drop existing tables if they exist (for clean initialization)
    await client.query(`
      DROP TABLE IF EXISTS incidents;
      DROP TABLE IF EXISTS users;
    `);

    // Create users table first
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        middle_name VARCHAR(100),
        last_name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        address TEXT NOT NULL,
        district VARCHAR(100) NOT NULL,
        user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('citizen', 'government_official')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_phone ON users(phone_number);
    `);

    // Then create incidents table with proper foreign key references
    await client.query(`
      CREATE TABLE incidents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        incident_type VARCHAR(50) NOT NULL,
        severity_level VARCHAR(20) NOT NULL,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        gps_coordinates VARCHAR(100),
        reported_by UUID REFERENCES users(id),
        reporter_name VARCHAR(255),
        reporter_phone VARCHAR(20),
        reporter_email VARCHAR(255),
        affected_people INTEGER,
        casualties INTEGER DEFAULT 0,
        assistance_needed VARCHAR(100)[] NOT NULL,
        area_accessible BOOLEAN DEFAULT true,
        photos TEXT[],
        dispatch_status VARCHAR(50) DEFAULT 'PENDING',
        teams_dispatched VARCHAR(100)[],
        response_time INTERVAL,
        incident_status VARCHAR(50) DEFAULT 'REPORTED',
        priority_level VARCHAR(20) DEFAULT 'MEDIUM',
        assigned_officer UUID REFERENCES users(id),
        resolution_date TIMESTAMP,
        comments TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_incidents_status ON incidents(incident_status);
      CREATE INDEX idx_incidents_type ON incidents(incident_type);
      CREATE INDEX idx_incidents_severity ON incidents(severity_level);
      CREATE INDEX idx_incidents_location ON incidents(location);
    `);

    await client.query('COMMIT');
    console.log('Database tables initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}

initDb();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});