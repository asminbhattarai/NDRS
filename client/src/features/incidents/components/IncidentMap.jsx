import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different severity levels
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const severityIcons = {
  CRITICAL: createIcon('red'),
  HIGH: createIcon('orange'),
  MEDIUM: createIcon('yellow'),
  LOW: createIcon('green')
};

const NEPAL_CENTER = [28.3949, 84.1240];
const DEFAULT_ZOOM = 7;

export default function IncidentMap({ incidents }) {
  const getMarkerIcon = (severity) => {
    return severityIcons[severity] || severityIcons.MEDIUM;
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

  return (
    <div className="incident-map-container">
      <MapContainer
        center={NEPAL_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {incidents.map(incident => {
          if (incident.gps_coordinates) {
            const [lat, lng] = incident.gps_coordinates.split(',').map(Number);
            return (
              <Marker
                key={incident.id}
                position={[lat, lng]}
                icon={getMarkerIcon(incident.severity_level)}
              >
                <Popup>
                  <div className="incident-popup">
                    <h3 className="font-semibold text-lg">{incident.title}</h3>
                    <p className="text-sm text-gray-600">{incident.incident_type}</p>
                    <p className="text-sm text-gray-600">{incident.location}</p>
                    <p className="text-sm text-gray-600">
                      Reported: {formatDate(incident.created_at)}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      Status: {incident.incident_status}
                    </p>
                    {incident.affected_people > 0 && (
                      <p className="text-sm text-red-600">
                        People affected: {incident.affected_people}
                      </p>
                    )}
                    {incident.assistance_needed && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Assistance needed:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {incident.assistance_needed.map((type, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}