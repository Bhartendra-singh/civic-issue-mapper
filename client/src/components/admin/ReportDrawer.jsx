import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import {
  X, MapPin, ExternalLink, Image as ImageIcon, User, Building2,
  Clock, ThumbsUp, Link2, Navigation, Trash2, Loader2, AlertTriangle,
} from 'lucide-react';
import { timeAgo } from '../../utils/timeAgo';
import Badge from '../ui/Badge';

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

const STATUS_SELECT_STYLES = {
  pending: 'bg-status-open-bg border-status-open/40 text-status-open',
  'in-progress': 'bg-status-progress-bg border-status-progress/40 text-status-progress',
  resolved: 'bg-status-resolved-bg border-status-resolved/40 text-status-resolved',
  reopened: 'bg-status-open-bg border-status-open/40 text-status-open',
};

function createColoredIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="background-color:${color}; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-light flex items-center justify-center shrink-0">
        <Icon size={15} className="text-cyan" />
      </div>
      <div className="min-w-0">
        <p className="font-body text-xs text-ink/50">{label}</p>
        <div className="font-body text-sm text-ink mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function ReportDrawer({ report, departments, onClose, onStatusChange, onDelete }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    setActivePhoto(0);
    setConfirmDelete(false);
    setDeleteError('');
  }, [report._id]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== 'Escape' || deleting) return;

      if (confirmDelete) {
        setConfirmDelete(false);
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, confirmDelete, deleting]);

  const handleConfirmDelete = async () => {
    setDeleteError('');
    setDeleting(true);

    try {
      await onDelete(report._id);
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  };

  const photos = report.photoUrls || [];
  const { lat, lng } = report.location;
  const department = departments.find((d) => d._id === report.department);
  const reporterName = report.user?.name || 'Unknown';
  const isActive =
  report.status === 'pending' || report.status === 'in-progress' || report.status === 'reopened';

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => !deleting && onClose()}
        className="fixed inset-0 z-[60] bg-navy/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
        className="fixed top-0 right-0 bottom-0 z-[61] w-full sm:max-w-md bg-white shadow-2xl flex flex-col"
        role="dialog"
        aria-label="Report details"
      >
        {/* Header */}
        <div className="bg-navy px-5 py-4 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge status="neutral">{CATEGORY_LABELS[report.category] || report.category}</Badge>
              <Badge status={report.status} />
            </div>
            <p className="font-body text-xs text-text-muted mt-2">
              Reported {timeAgo(report.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            aria-label="Close"
            className="text-text-muted hover:text-cyan transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">

          {/* Photos */}
          <div>
            <div className="aspect-video w-full rounded-xl bg-light border border-hairline overflow-hidden flex items-center justify-center">
              {photos.length > 0 ? (
                <img
                  src={photos[activePhoto]?.url}
                  alt={report.category}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon size={32} className="text-ink/30" />
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 mt-2">
                {photos.map((photo, i) => (
                  <button
                    key={photo.publicId || i}
                    onClick={() => setActivePhoto(i)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${
                      i === activePhoto ? 'border-cyan' : 'border-transparent'
                    }`}
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="font-heading text-sm font-bold text-ink mb-1.5">Description</p>
            <p className="font-body text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>
          </div>

          {/* Location */}
          <div>
            <p className="font-heading text-sm font-bold text-ink mb-2">Location</p>
            <div className="isolate rounded-xl overflow-hidden border border-hairline">
              <MapContainer
                key={report._id}
                center={[lat, lng]}
                zoom={16}
                scrollWheelZoom={false}
                style={{ height: '180px', width: '100%' }}
              >
                <TileLayer
                  url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_KEY}`}
                  attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                  maxZoom={19}
                />
                <Marker
                  position={[lat, lng]}
                  icon={createColoredIcon(STATUS_COLORS[report.status] || '#94a3b8')}
                />
              </MapContainer>
            </div>
            <div className="flex items-center justify-between gap-3 mt-2">
              <span className="flex items-center gap-1 font-body text-xs text-ink/60">
                <MapPin size={12} /> {lat.toFixed(5)}, {lng.toFixed(5)}
              </span>
              <a
                href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-body text-xs font-semibold text-cyan hover:underline"
              >
                <Navigation size={12} /> Open in Maps
              </a>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4 border-t border-hairline pt-5">
            <InfoRow icon={User} label="Reported by">{reporterName}</InfoRow>

            <InfoRow icon={Building2} label="Department">
              {department ? (
                <>
                  {department.name}
                  <span className="text-ink/50"> · SLA {department.slaHours ?? 72}h</span>
                </>
              ) : (
                <span className="text-ink/50">Not assigned</span>
              )}
            </InfoRow>

            <InfoRow icon={ThumbsUp} label="Upvotes">{report.upvoteCount ?? 0}</InfoRow>

            {isActive && (
              <InfoRow icon={Clock} label="Priority score">{report.priorityScore ?? 0}</InfoRow>
            )}

            <InfoRow icon={Link2} label="Duplicate group">
              {report.clusterId ? (
                <span className="text-cyan font-semibold">Part of a duplicate cluster</span>
              ) : (
                <span className="text-ink/50">No duplicates detected</span>
              )}
            </InfoRow>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-hairline p-5 bg-white">
          {confirmDelete ? (
            <div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-status-open-bg flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} className="text-status-open" />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-ink">Delete this report?</p>
                  <p className="font-body text-xs text-ink/60 mt-1">
                    This permanently removes the report, its photos, upvotes and comments.
                    The citizen is not notified. This cannot be undone.
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className="bg-status-open-bg border border-status-open/30 text-status-open text-xs rounded-lg px-3 py-2 mt-3">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="rounded-full border border-hairline px-4 py-2 font-body text-sm font-semibold text-ink/70 hover:border-cyan hover:text-cyan transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-status-open px-5 py-2 font-body text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <select
                  value={report.status}
                  onChange={(e) => onStatusChange(report._id, e.target.value)}
                  className={`border rounded-full px-4 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-cyan/30 cursor-pointer transition-colors ${
                    STATUS_SELECT_STYLES[report.status] || 'bg-light border-hairline text-ink'
                  }`}
                >
                  <option value="pending" style={{ backgroundColor: '#ffffff', color: '#2C3E5C' }}>Pending</option>
                  <option value="in-progress" style={{ backgroundColor: '#ffffff', color: '#2C3E5C' }}>In Progress</option>
                  <option value="resolved" style={{ backgroundColor: '#ffffff', color: '#2C3E5C' }}>Resolved</option>
                  <option value="reopened" style={{ backgroundColor: '#ffffff', color: '#2C3E5C' }}>Reopened</option>
                </select>

                <Link
                  to={`/reports/${report._id}`}
                  className="flex items-center gap-1.5 font-body text-sm font-semibold text-cyan hover:underline"
                >
                  Open full page <ExternalLink size={14} />
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-status-open/40 px-4 py-2 font-body text-xs font-semibold text-status-open hover:bg-status-open-bg transition-colors"
              >
                <Trash2 size={14} /> Delete Report
              </button>
            </>
          )}
        </div>
      </motion.aside>
    </>
  );
}

export default ReportDrawer;