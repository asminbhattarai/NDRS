import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Filter, MapPin, Clock, Users, Activity, Map as MapIcon } from 'lucide-react';
import IncidentMap from './IncidentMap';
import '../styles/IncidentList.css';

const SEVERITY_COLORS = {
  LOW: 'bg-yellow-100 text-yellow-800',
  MEDIUM: 'bg-orange-100 text-orange-800',
  HIGH: 'bg-red-100 text-red-800',
  CRITICAL: 'bg-red-600 text-white'
};

const STATUS_COLORS = {
  REPORTED: 'bg-blue-100 text-blue-800',
  INVESTIGATING: 'bg-purple-100 text-purple-800',
  RESPONDING: 'bg-green-100 text-green-800',
  RESOLVED: 'bg-gray-100 text-gray-800'
};

export default function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    status: ''
  });

  useEffect(() => {
    fetchIncidents();
  }, [filters]);

  const fetchIncidents = async () => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`http://localhost:5000/api/incidents/list?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }

      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="incident-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="incident-list-container">
      <div className="incident-list-header">
        <div className="header-content">
          <h1 className="header-title">
            <AlertTriangle className="header-icon" />
            Reported Incidents
          </h1>
          <div className="header-actions">
            <Link to="/emergency-report" className="emergency-button">
              Emergency Report
            </Link>
            <Link to="/report-incident" className="report-button">
              Detailed Report
            </Link>
          </div>
        </div>

        <div className="view-toggle">
          <button
            className={`toggle-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <Activity className="w-4 h-4" />
            List View
          </button>
          <button
            className={`toggle-button ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <MapIcon className="w-4 h-4" />
            Map View
          </button>
        </div>

        <div className="filters-section">
          <div className="filters-header">
            <Filter className="filter-icon" />
            <span>Filters</span>
          </div>
          
          <div className="filters-grid">
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Flood">Flood</option>
              <option value="Landslide">Landslide</option>
              <option value="Fire">Fire</option>
              <option value="Other">Other</option>
            </select>

            <select
              name="severity"
              value={filters.severity}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="REPORTED">Reported</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESPONDING">Responding</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'map' ? (
        <IncidentMap incidents={incidents} />
      ) : (
        incidents.length === 0 ? (
          <div className="no-incidents">
            <AlertTriangle className="no-incidents-icon" />
            <p>No incidents found</p>
          </div>
        ) : (
          <div className="incidents-grid">
            {incidents.map(incident => (
              <div key={incident.id} className="incident-card">
                <div className="card-header">
                  <h2 className="incident-title">{incident.title}</h2>
                  <span className={`severity-badge ${SEVERITY_COLORS[incident.severity_level]}`}>
                    {incident.severity_level}
                  </span>
                </div>

                <div className="card-content">
                  <div className="info-row">
                    <MapPin className="info-icon" />
                    <span>{incident.location}</span>
                  </div>

                  <div className="info-row">
                    <Clock className="info-icon" />
                    <span>{formatDate(incident.created_at)}</span>
                  </div>

                  {incident.affected_people > 0 && (
                    <div className="info-row">
                      <Users className="info-icon" />
                      <span>{incident.affected_people} people affected</span>
                    </div>
                  )}

                  <div className="info-row">
                    <Activity className="info-icon" />
                    <span className={`status-badge ${STATUS_COLORS[incident.incident_status]}`}>
                      {incident.incident_status}
                    </span>
                  </div>

                  {incident.assistance_needed && (
                    <div className="assistance-tags">
                      {incident.assistance_needed.map((type, index) => (
                        <span key={index} className="assistance-tag">
                          {type}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Link to={`/incidents/${incident.id}`} className="view-details-button">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}