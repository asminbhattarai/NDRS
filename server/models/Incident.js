import { pool } from '../db/config.js';

export const incidentModel = {
  // Create a new incident
  create: async (incidentData) => {
    const {
      title,
      incident_type,
      severity_level,
      description,
      location,
      gps_coordinates,
      reported_by,
      reporter_name,
      reporter_phone,
      reporter_email,
      affected_people,
      casualties,
      assistance_needed,
      area_accessible,
      photos
    } = incidentData;

    const query = `
      INSERT INTO incidents (
        title, incident_type, severity_level, description, location,
        gps_coordinates, reported_by, reporter_name, reporter_phone,
        reporter_email, affected_people, casualties, assistance_needed,
        area_accessible, photos
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      title,
      incident_type,
      severity_level,
      description,
      location,
      gps_coordinates,
      reported_by,
      reporter_name,
      reporter_phone,
      reporter_email,
      affected_people,
      casualties,
      assistance_needed,
      area_accessible,
      photos
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get all incidents with optional filters
  getAll: async (filters = {}) => {
    let query = 'SELECT * FROM incidents';
    const values = [];
    const conditions = [];

    if (filters.incident_type) {
      conditions.push(`incident_type = $${values.length + 1}`);
      values.push(filters.incident_type);
    }

    if (filters.severity_level) {
      conditions.push(`severity_level = $${values.length + 1}`);
      values.push(filters.severity_level);
    }

    if (filters.incident_status) {
      conditions.push(`incident_status = $${values.length + 1}`);
      values.push(filters.incident_status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Get incident by ID
  getById: async (id) => {
    const query = 'SELECT * FROM incidents WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Update incident
  update: async (id, updateData) => {
    const allowedFields = [
      'title',
      'incident_type',
      'severity_level',
      'description',
      'location',
      'affected_people',
      'casualties',
      'assistance_needed',
      'area_accessible',
      'dispatch_status',
      'teams_dispatched',
      'incident_status',
      'priority_level',
      'assigned_officer',
      'resolution_date',
      'comments'
    ];

    const updates = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (updates.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE incidents 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Delete incident
  delete: async (id) => {
    const query = 'DELETE FROM incidents WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
};