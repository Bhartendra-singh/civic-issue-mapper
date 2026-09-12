import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getAllPublicReports } from '../services/api';


const categoryColors = {
  pothole: '#B5541F',
  garbage: '#3F6C51',
  waterlogging: '#2C3E5C',
  streetlight: '#D9A441',
  drain: '#8B5A2B',
  other: '#6B6B6B',
};


function createColoredIcon(color) {
    return L.divIcon({
        className: '',
        html: `<div style="background-color:${color}; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });
}

function MapExplorer() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
        try {
            const data = await getAllPublicReports();
            setReports(data.reports);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchReports();
  }, []);


    if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-body text-ink">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="px-6 py-6">
        <h2 className="font-heading text-2xl font-bold text-ink mb-2">
          Map Explorer
        </h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4 max-w-2xl">
            {error}
          </div>
        )}
      </div>

      <div className="px-6 pb-10">
        <MapContainer
          center={[30.3165, 78.0322]}
          zoom={13}
          style={{ height: '70vh', width: '100%', borderRadius: '8px' }}
        >
            <TileLayer
              url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_KEY}`}
              attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
              maxZoom={19}
            />

          {reports.map((report) => (
            <Marker
              key={report._id}
              position={[report.location.lat, report.location.lng]}
              icon={createColoredIcon(categoryColors[report.category] || '#6B6B6B')}
            >
              <Popup>
                <p className="font-semibold capitalize">{report.category}</p>
                <p className="text-sm capitalize">{report.status}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );

}

export default MapExplorer;