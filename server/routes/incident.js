import express from 'express';
import { incidentModel } from '../models/Incident.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create new incident
router.post('/report', async (req, res) => {
  try {
    const incidentData = {
      ...req.body,
      reported_by: req.user?.id // If authenticated
    };
    const incident = await incidentModel.create(incidentData);
    res.status(201).json(incident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// Get all incidents with optional filters
router.get('/list', async (req, res) => {
  try {
    const filters = {
      incident_type: req.query.type,
      severity_level: req.query.severity,
      incident_status: req.query.status
    };
    const incidents = await incidentModel.getAll(filters);
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Get incident by ID
router.get('/:id', async (req, res) => {
  try {
    const incident = await incidentModel.getById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// Update incident (requires authentication)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const incident = await incidentModel.update(req.params.id, req.body);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// Delete incident (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const incident = await incidentModel.delete(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    console.error('Error deleting incident:', error);
    res.status(500).json({ error: 'Failed to delete incident' });
  }
});

export { router as incidentRouter };