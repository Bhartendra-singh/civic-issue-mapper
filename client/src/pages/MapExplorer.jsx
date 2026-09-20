import { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { AlertTriangle, Loader2, ThumbsUp, ExternalLink } from 'lucide-react';
import { getAllPublicReports, toggleUpvote, getMyUpvotedReportIds } from '../services/api';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

const CATEGORY_LABELS = {
  pothole: 'Pothole',
  garbage: 'Garbage',
  waterlogging: 'Waterlogging',
  streetlight: 'Streetlight',
  drain: 'Drain',
  other: 'Other',
};

const STATUS_COLORS = {
  pending: '#fb7185',
  'in-progress': '#f59e0b',
  resolved: '#10b981',
  reopened: '#fb7185',
};

const CATEGORY_OPTIONS = ['all', 'pothole', 'garbage', 'waterlogging', 'streetlight', 'drain', 'other'];
const STATUS_OPTIONS = ['all', 'pending', 'in-progress', 'resolved', 'reopened'];

function createColoredIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="background-color:${color}; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function PopupContent({ report, upvoteState, onUpvote }) {
  const { count, isUpvoted, loading } = upvoteState;

  return (
    <div className="min-w-[180px]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-body text-[11px] font-semibold text-cyan uppercase tracking-wide">
          {CATEGORY_LABELS[report.category] || report.category}
        </span>
        <Badge status={report.status} />
      </div>

      <p className="font-body text-sm text-ink mt-2">{report.description}</p>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={onUpvote}
          disabled={loading}
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
            isUpvoted
              ? 'bg-cyan-dim border-cyan text-cyan'
              : 'border-hairline text-ink/60 hover:border-cyan hover:text-cyan'
          }`}
        >
          <ThumbsUp size={12} /> {count}
        </button>

        <Link
          to={`/reports/${report._id}`}
          className="flex items-center gap-1 text-xs font-semibold text-cyan hover:underline"
        >
          View Details <ExternalLink size={11} />
        </Link>
      </div>
    </div>
  );
}

function MapExplorer() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [upvoteStates, setUpvoteStates] = useState({});
  const upvoteInFlight = useRef({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getAllPublicReports();
        setReports(data.reports);

        if (user) {
          const upvotedData = await getMyUpvotedReportIds();
          const upvotedSet = new Set(upvotedData.reportIds);

          const initialStates = {};
          data.reports.forEach((report) => {
            initialStates[report._id] = {
              count: report.upvoteCount ?? 0,
              isUpvoted: upvotedSet.has(report._id),
              loading: false,
            };
          });
          setUpvoteStates(initialStates);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const categoryMatch = categoryFilter === 'all' || report.category === categoryFilter;
      const statusMatch = statusFilter === 'all' || report.status === statusFilter;
      return categoryMatch && statusMatch;
    });
  }, [reports, categoryFilter, statusFilter]);

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const progressCount = reports.filter((r) => r.status === 'in-progress').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved' || r.status === 'reopened').length;

  const getUpvoteState = (reportId) =>
    upvoteStates[reportId] || { count: 0, isUpvoted: false, loading: false };

  const handleUpvote = async (reportId) => {
    if (upvoteInFlight.current[reportId]) return;
    upvoteInFlight.current[reportId] = true;

    const current = getUpvoteState(reportId);
    const previousIsUpvoted = current.isUpvoted;
    const previousCount = current.count;

    setUpvoteStates((prev) => ({
      ...prev,
      [reportId]: {
        ...current,
        isUpvoted: !previousIsUpvoted,
        count: previousIsUpvoted ? previousCount - 1 : previousCount + 1,
        loading: true,
      },
    }));

    try {
      const data = await toggleUpvote(reportId);
      setUpvoteStates((prev) => ({
        ...prev,
        [reportId]: {
          ...prev[reportId],
          isUpvoted: data.upvoted,
          count: data.upvoted ? previousCount + 1 : previousCount - 1,
          loading: false,
        },
      }));
    } catch (err) {
      setUpvoteStates((prev) => ({
        ...prev,
        [reportId]: {
          ...current,
          isUpvoted: previousIsUpvoted,
          count: previousCount,
          loading: false,
        },
      }));
    } finally {
      upvoteInFlight.current[reportId] = false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-cyan animate-spin" />
          <p className="font-body text-ink/60 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">

      {/* ── Dark Hero-Strip ── */}
      <div className="relative bg-navy px-6 py-10 overflow-hidden">
        <div className="absolute -top-16 right-10 w-56 h-56 rounded-full border border-cyan-dim"></div>
        <div className="absolute -top-4 right-24 w-36 h-36 rounded-full border border-cyan-dim"></div>

        <div className="relative max-w-6xl mx-auto flex items-end justify-between flex-wrap gap-6">
          <div>
            <h2 className="font-heading text-3xl font-bold text-text-primary">
              Map Explorer
            </h2>
            <p className="font-body text-sm text-text-muted mt-1">
              Every reported issue, live on the map.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-panel border border-cyan-dim rounded-xl px-5 py-3 min-w-[90px]">
              <p className="font-heading text-2xl font-bold text-status-open">{pendingCount}</p>
              <p className="font-body text-xs text-text-muted mt-0.5">Pending</p>
            </div>
            <div className="bg-panel border border-cyan-dim rounded-xl px-5 py-3 min-w-[90px]">
              <p className="font-heading text-2xl font-bold text-status-progress">{progressCount}</p>
              <p className="font-body text-xs text-text-muted mt-0.5">In Progress</p>
            </div>
            <div className="bg-panel border border-cyan-dim rounded-xl px-5 py-3 min-w-[90px]">
              <p className="font-heading text-2xl font-bold text-status-resolved">{resolvedCount}</p>
              <p className="font-body text-xs text-text-muted mt-0.5">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {error && (
          <div className="flex items-center gap-2 bg-status-open-bg border border-status-open/30 text-status-open text-sm rounded-lg px-4 py-3 mb-6 max-w-2xl">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  categoryFilter === cat
                    ? 'bg-navy border-navy text-white'
                    : 'border-hairline text-ink/60 hover:border-cyan hover:text-cyan'
                }`}
              >
                {cat === 'all' ? 'All Categories' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 sm:ml-auto">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  statusFilter === status
                    ? 'bg-cyan border-cyan text-navy'
                    : 'border-hairline text-ink/60 hover:border-cyan hover:text-cyan'
                }`}
              >
                {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="rounded-2xl border border-cyan-dim overflow-hidden">
          <MapContainer
            center={[30.3165, 78.0322]}
            zoom={13}
            style={{ height: '65vh', width: '100%' }}
          >
            <TileLayer
              url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_KEY}`}
              attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
              maxZoom={19}
            />

            {filteredReports.map((report) => (
              <Marker
                key={report._id}
                position={[report.location.lat, report.location.lng]}
                icon={createColoredIcon(STATUS_COLORS[report.status] || '#94a3b8')}
              >
                <Popup>
                  <PopupContent
                    report={report}
                    upvoteState={getUpvoteState(report._id)}
                    onUpvote={() => handleUpvote(report._id)}
                  />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-5 mt-4 text-xs font-body text-ink/60">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-open"></span> Pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-progress"></span> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-resolved"></span> Resolved
          </span>
          <span className="font-body text-ink/40">
            Showing {filteredReports.length} of {reports.length} reports
          </span>
        </div>
      </div>
    </div>
  );
}

export default MapExplorer;