import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, ThumbsUp, MessageCircle, RotateCcw, Star,
  Loader2, AlertTriangle, Image as ImageIcon, Send, Trash2, Link2,
  Pencil, X, Plus, CheckCircle2, Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/timeAgo';
import {
  getReportById, toggleUpvote, reopenReport, editReport, deleteReport,
  getComments, postComment, deleteComment,
  getFeedback, submitFeedback, getMyUpvotedReportIds, getReportsByCluster
} from '../services/api';
import { connectSocket } from '../services/socket';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const CATEGORY_LABELS = {
  pothole: 'Pothole', garbage: 'Garbage', waterlogging: 'Waterlogging',
  streetlight: 'Streetlight', drain: 'Drain', other: 'Other',
};

const REOPEN_WINDOW_DAYS = 7;
const MAX_PHOTOS = 4;

function canReopen(report) {
  if (!report || report.status !== 'resolved') return false;
  if (report.hasBeenReopened) return false;
  if (!report.resolvedAt) return false;
  const days = (Date.now() - new Date(report.resolvedAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= REOPEN_WINDOW_DAYS;
}

function StarRatingInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="text-2xl leading-none"
        >
          <Star
            size={24}
            className={star <= value ? 'fill-status-progress text-status-progress' : 'text-hairline'}
          />
        </button>
      ))}
    </div>
  );
}

function DeleteReportModal({ onClose, onConfirm, deleting, error }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !deleting) onClose();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, deleting]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => !deleting && onClose()}
        className="fixed inset-0 z-[60] bg-navy/60 backdrop-blur-sm"
      />

      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          role="alertdialog"
          aria-label="Delete report"
          className="pointer-events-auto bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="h-1.5 w-full bg-status-open"></div>

          <div className="p-6">
            <div className="w-12 h-12 rounded-full bg-status-open-bg flex items-center justify-center">
              <AlertTriangle size={22} className="text-status-open" />
            </div>

            <p className="font-heading text-xl font-bold text-ink mt-4">Delete this report?</p>
            <p className="font-body text-sm text-ink/60 mt-2">
              This permanently removes the report, its photos, upvotes and comments.
              This action cannot be undone.
            </p>

            {error && (
              <div className="bg-status-open-bg border border-status-open/30 text-status-open text-sm rounded-lg px-4 py-3 mt-4">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button type="button" variant="outline" size="md" onClick={onClose} disabled={deleting}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-status-open px-5 py-2.5 font-body text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deleting ? 'Deleting...' : 'Delete Report'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function EditReportModal({ report, onClose, onSaved }) {
  const [description, setDescription] = useState(report.description || '');
  const [removeIds, setRemoveIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const keptPhotos = (report.photoUrls || []).filter((p) => !removeIds.includes(p.publicId));
  const totalPhotos = keptPhotos.length + newFiles.length;

  const newPreviews = useMemo(
    () => newFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [newFiles]
  );

  useEffect(() => {
    return () => newPreviews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [newPreviews]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, saving]);

  const hasChanges =
    description.trim() !== (report.description || '').trim() ||
    removeIds.length > 0 ||
    newFiles.length > 0;

  const handleAddFiles = (e) => {
    const picked = Array.from(e.target.files);
    const combined = [...newFiles];

    for (const file of picked) {
      const isDuplicate = combined.some((f) => f.name === file.name && f.size === file.size);
      if (!isDuplicate) combined.push(file);
    }

    const room = MAX_PHOTOS - keptPhotos.length;

    if (combined.length > room) {
      setError(`A report can have a maximum of ${MAX_PHOTOS} photos`);
    } else {
      setError('');
    }

    setNewFiles(combined.slice(0, Math.max(room, 0)));
    e.target.value = '';
  };

  const removeExisting = (publicId) => {
    setRemoveIds((prev) => [...prev, publicId]);
    setError('');
  };

  const removeNew = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = description.trim();

    if (!trimmed) {
      setError('Description cannot be empty');
      return;
    }

    if (totalPhotos < 1) {
      setError('A report must have at least 1 photo');
      return;
    }

    if (!hasChanges) {
      onClose();
      return;
    }

    const formData = new FormData();

    if (trimmed !== (report.description || '').trim()) {
      formData.append('description', trimmed);
    }

    if (removeIds.length > 0) {
      formData.append('removePhotoIds', removeIds.join(','));
    }

    newFiles.forEach((file) => formData.append('photos', file));

    setSaving(true);
    try {
      const data = await editReport(report._id, formData);
      onSaved(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => !saving && onClose()}
        className="fixed inset-0 z-[60] bg-navy/60 backdrop-blur-sm"
      />

      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <motion.form
          onSubmit={handleSave}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          role="dialog"
          aria-label="Edit report"
          className="pointer-events-auto bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan via-cyan-deep to-navy shrink-0"></div>

          <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center">
                <Pencil size={18} className="text-cyan" />
              </div>
              <div>
                <p className="font-heading text-lg font-bold text-ink">Edit Report</p>
                <p className="font-body text-xs text-ink/50">
                  You can edit while the report is pending.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
              className="text-ink/40 hover:text-status-open transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-6 pb-4 overflow-y-auto flex-1">
            {error && (
              <div className="bg-status-open-bg border border-status-open/30 text-status-open text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <Input
              id="edit-description"
              label="Description"
              type="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={4}
              required
            />
            <p className="font-body text-xs text-ink/40 text-right mt-1">
              {description.length}/500
            </p>

            <div className="mt-4">
              <p className="font-body text-sm font-semibold text-ink mb-2">
                Photos <span className="font-normal text-ink/50">({totalPhotos}/{MAX_PHOTOS})</span>
              </p>

              <div className="grid grid-cols-4 gap-2">
                {keptPhotos.map((photo) => (
                  <div
                    key={photo.publicId}
                    className="relative aspect-square rounded-lg overflow-hidden border border-hairline"
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExisting(photo.publicId)}
                      aria-label="Remove photo"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-navy/80 text-white flex items-center justify-center hover:bg-status-open"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {newPreviews.map((item, i) => (
                  <div
                    key={`${item.file.name}-${item.file.size}`}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-cyan"
                  >
                    <img src={item.url} alt={item.file.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 text-[10px] font-semibold bg-cyan text-navy rounded px-1">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNew(i)}
                      aria-label="Remove new photo"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-navy/80 text-white flex items-center justify-center hover:bg-status-open"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {totalPhotos < MAX_PHOTOS && (
                  <label className="aspect-square rounded-lg border border-dashed border-hairline flex flex-col items-center justify-center gap-1 cursor-pointer text-cyan hover:border-cyan hover:bg-cyan-dim/20 transition-colors">
                    <Plus size={18} />
                    <span className="font-body text-[10px] font-semibold">Add</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      multiple
                      onChange={handleAddFiles}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {removeIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setRemoveIds([])}
                  className="font-body text-xs font-semibold text-cyan hover:underline mt-2"
                >
                  Undo removed photos
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-hairline shrink-0">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" icon={Save} loading={saving}>
              Save Changes
            </Button>
          </div>
        </motion.form>
      </div>
    </>
  );
}

function ReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState('');

  const deletedByMe = useRef(false);

  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [reopenLoading, setReopenLoading] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  const [similarReports, setSimilarReports] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const isOwner = !!report?.isOwner;

  useEffect(() => {
    getReportById(id)
      .then((data) => {
        setReport(data.report);
        setUpvoteCount(data.report.upvoteCount ?? 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    if (user) {
      getMyUpvotedReportIds()
        .then((data) => setIsUpvoted(data.reportIds.includes(id)))
        .catch(() => {});
    }

    getComments(id)
      .then((data) => setComments(data.comments))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));

    getFeedback(id)
      .then((data) => setFeedback(data.feedback))
      .catch(() => setFeedback(null))
      .finally(() => setFeedbackLoading(false));
  }, [id, user]);

  useEffect(() => {
    if (!report?.clusterId) {
      setSimilarReports([]);
      return;
    }

    setSimilarLoading(true);
    getReportsByCluster(report.clusterId)
      .then((data) => {
        const others = data.reports.filter((r) => r._id !== report._id);
        setSimilarReports(others);
      })
      .catch(() => setSimilarReports([]))
      .finally(() => setSimilarLoading(false));
  }, [report?._id]);

  useEffect(() => {
    if (!user) return;

    const socket = connectSocket();

    const joinRoom = () => socket.emit('report:join', id);
    joinRoom();
    socket.on('connect', joinRoom);

    const handleUpvoted = ({ reportId, upvoteCount }) => {
      if (reportId === id) setUpvoteCount(upvoteCount);
    };

    const handleCommentNew = (comment) => {
      setComments((prev) =>
        prev.some((c) => c._id === comment._id) ? prev : [comment, ...prev]
      );
    };

    const handleCommentDeleted = ({ commentId }) => {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    };

    const handleReportUpdated = ({ _id, status, clusterId, resolvedAt, hasBeenReopened }) => {
      if (_id !== id) return;
      setReport((prev) =>
        prev ? { ...prev, status, clusterId, resolvedAt, hasBeenReopened } : prev
      );
    };

    const handleReportDeleted = ({ _id }) => {
      if (_id !== id || deletedByMe.current) return;
      setEditOpen(false);
      setDeleteOpen(false);
      setReport(null);
      setError('This report has been deleted.');
    };

    socket.on('report:upvoted', handleUpvoted);
    socket.on('comment:new', handleCommentNew);
    socket.on('comment:deleted', handleCommentDeleted);
    socket.on('report:updated', handleReportUpdated);
    socket.on('report:deleted', handleReportDeleted);

    return () => {
      socket.emit('report:leave', id);
      socket.off('connect', joinRoom);
      socket.off('report:upvoted', handleUpvoted);
      socket.off('comment:new', handleCommentNew);
      socket.off('comment:deleted', handleCommentDeleted);
      socket.off('report:updated', handleReportUpdated);
      socket.off('report:deleted', handleReportDeleted);
    };
  }, [id, user]);

  const requireLogin = () => {
    navigate('/login', { state: { from: location } });
  };

  const handleUpvote = async () => {
    if (!user) return requireLogin();
    setUpvoteLoading(true);
    const wasUpvoted = isUpvoted;
    setIsUpvoted(!wasUpvoted);
    setUpvoteCount((c) => (wasUpvoted ? c - 1 : c + 1));

    try {
      const data = await toggleUpvote(id);
      setIsUpvoted(data.upvoted);
    } catch (err) {
      setIsUpvoted(wasUpvoted);
      setUpvoteCount((c) => (wasUpvoted ? c + 1 : c - 1));
    } finally {
      setUpvoteLoading(false);
    }
  };

  const handleReopen = async () => {
    setReopenLoading(true);
    try {
      const data = await reopenReport(id);
      setReport((prev) => ({
        ...prev,
        status: data.report.status,
        hasBeenReopened: data.report.hasBeenReopened,
        resolvedAt: data.report.resolvedAt,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setReopenLoading(false);
    }
  };

  const handleReportEdited = (updated) => {
    setReport((prev) => ({
      ...prev,
      description: updated.description,
      photoUrls: updated.photoUrls,
    }));
    setActivePhoto(0);
    setEditOpen(false);
    setNotice('Report updated successfully.');
    setTimeout(() => setNotice(''), 3000);
  };

  const openDelete = () => {
    setDeleteError('');
    setDeleteOpen(true);
  };

  const handleDeleteReport = async () => {
    setDeleteError('');
    setDeleting(true);
    try {
      await deleteReport(id);
      deletedByMe.current = true;
      navigate('/my-reports');
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!user) return requireLogin();
    if (!newComment.trim()) return;

    setCommentError('');
    setCommentSubmitting(true);
    try {
      const data = await postComment(id, newComment);
      setComments((prev) =>
        prev.some((c) => c._id === data.comment._id) ? prev : [data.comment, ...prev]
      );
      setNewComment('');
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      setCommentError(err.message);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (feedbackRating === 0) {
      setFeedbackError('Please select a star rating');
      return;
    }
    setFeedbackError('');
    setFeedbackSubmitting(true);
    try {
      const data = await submitFeedback(id, feedbackRating, feedbackComment);
      setFeedback(data.feedback);
    } catch (err) {
      setFeedbackError(err.message);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <Loader2 size={32} className="text-cyan animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-light flex flex-col items-center justify-center gap-3">
        <AlertTriangle size={32} className="text-status-open" />
        <p className="font-body text-ink">{error || 'Report not found'}</p>
        <Link to="/map" className="text-cyan text-sm font-semibold hover:underline">Back to Map</Link>
      </div>
    );
  }

  const photos = report.photoUrls || [];
  const canEdit = isOwner && report.status === 'pending';
  const canDelete = isOwner && report.status === 'pending';

  return (
    <div className="min-h-screen bg-light">

      {/* ── Dark Hero-Strip ── */}
      <div className="bg-navy px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-text-muted hover:text-cyan text-sm font-semibold transition-colors mb-4"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <Badge status="neutral">{CATEGORY_LABELS[report.category] || report.category}</Badge>
            <Badge status={report.status} />
            {report.department && (
              <span className="text-xs text-text-muted">→ {report.department.name}</span>
            )}
          </div>

          <p className="font-body text-text-muted text-sm mt-3 flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
            </span>
            <span>Reported {timeAgo(report.createdAt)}</span>
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {notice && (
          <div className="flex items-center gap-2 bg-status-resolved-bg border border-status-resolved/30 text-status-resolved text-sm rounded-lg px-4 py-3 mb-6">
            <CheckCircle2 size={16} /> {notice}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left — photos, description, comments */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            <Card padding="none" className="overflow-hidden">
              <div className="aspect-video w-full bg-panel flex items-center justify-center overflow-hidden">
                {photos.length > 0 ? (
                  <img src={photos[activePhoto]?.url} alt={report.category} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={40} className="text-text-muted" />
                )}
              </div>
              {photos.length > 1 && (
                <div className="flex gap-2 p-3">
                  {photos.map((photo, i) => (
                    <button
                      key={photo.publicId || i}
                      onClick={() => setActivePhoto(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${
                        i === activePhoto ? 'border-cyan' : 'border-transparent'
                      }`}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <Card padding="lg">
              <p className="font-heading text-lg font-bold text-ink mb-2">Description</p>
              <p className="font-body text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">{report.description}</p>
            </Card>

            {report.clusterId && (
              <Card padding="lg">
                <p className="font-heading text-lg font-bold text-ink mb-3 flex items-center gap-2">
                  <Link2 size={18} className="text-cyan" /> Similar Reports Nearby
                </p>
                <p className="font-body text-xs text-ink/50 mb-4">
                  Other citizens have reported the same issue near this location.
                </p>

                {similarLoading ? (
                  <Loader2 size={20} className="text-cyan animate-spin mx-auto" />
                ) : similarReports.length === 0 ? (
                  <p className="font-body text-sm text-ink/50">No other reports in this group.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {similarReports.map((r) => (
                      <button
                        key={r._id}
                        onClick={() => navigate(`/reports/${r._id}`)}
                        className="flex items-center gap-3 text-left border border-hairline rounded-xl p-3 hover:border-cyan transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg bg-panel overflow-hidden shrink-0 flex items-center justify-center">
                          {r.photoUrls?.[0]?.url ? (
                            <img src={r.photoUrls[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={16} className="text-text-muted" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm text-ink truncate">{r.description}</p>
                          <p className="font-body text-xs text-ink/40 mt-0.5">{timeAgo(r.createdAt)}</p>
                        </div>
                        <Badge status={r.status} />
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Comments */}
            <Card padding="lg">
              <p className="font-heading text-lg font-bold text-ink mb-4 flex items-center gap-2">
                <MessageCircle size={18} /> Comments ({comments.length})
              </p>

              <form onSubmit={handlePostComment} className="flex flex-col gap-3 mb-6">
                <Input
                  id="new-comment"
                  type="textarea"
                  placeholder={user ? 'Write a comment...' : 'Log in to comment'}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={500}
                />
                {commentError && (
                  <p className="text-xs text-status-open">{commentError}</p>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={Send}
                  loading={commentSubmitting}
                  className="self-end"
                >
                  Post Comment
                </Button>
              </form>

              {commentsLoading ? (
                <Loader2 size={20} className="text-cyan animate-spin mx-auto" />
              ) : comments.length === 0 ? (
                <p className="font-body text-sm text-ink/50 text-center py-4">No comments yet. Be the first.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {comments.map((c) => {
                    const canDeleteComment = user && (String(c.user?._id) === String(user._id || user.id) || user.role === 'admin');
                    return (
                      <div key={c._id} className="flex items-start justify-between gap-3 border-t border-hairline pt-4">
                        <div>
                          <p className="font-body text-sm font-semibold text-ink">{c.user?.name || 'Unknown'}</p>
                          <p className="font-body text-sm text-ink/70 mt-0.5">{c.text}</p>
                          <p className="font-body text-xs text-ink/40 mt-1">{timeAgo(c.createdAt)}</p>
                        </div>
                        {canDeleteComment && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="text-ink/30 hover:text-status-open transition-colors shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Right — actions sidebar */}
          <div className="flex flex-col gap-6">

            <Card padding="lg">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleUpvote}
                  disabled={upvoteLoading}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-full border transition-colors ${
                    isUpvoted
                      ? 'bg-cyan-dim border-cyan text-cyan'
                      : 'border-hairline text-ink/60 hover:border-cyan hover:text-cyan'
                  }`}
                >
                  <ThumbsUp size={15} /> {upvoteCount}
                </button>
                <span className="font-body text-xs text-ink/50">upvotes</span>
              </div>

              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Pencil}
                  onClick={() => setEditOpen(true)}
                  className="w-full mt-4"
                >
                  Edit Report
                </Button>
              )}

              {canReopen(report) && isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={RotateCcw}
                  loading={reopenLoading}
                  onClick={handleReopen}
                  className="w-full mt-4"
                >
                  Reopen Report
                </Button>
              )}

              {canDelete && (
                <button
                  type="button"
                  onClick={openDelete}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-status-open/40 px-4 py-2 font-body text-xs font-semibold text-status-open hover:bg-status-open-bg transition-colors"
                >
                  <Trash2 size={14} /> Delete Report
                </button>
              )}
            </Card>

            {report.status === 'resolved' && isOwner && (
              <Card padding="lg">
                <p className="font-heading text-sm font-bold text-ink mb-3">Rate the Resolution</p>

                {feedbackLoading ? (
                  <Loader2 size={18} className="text-cyan animate-spin" />
                ) : feedback ? (
                  <div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={18}
                          className={s <= feedback.rating ? 'fill-status-progress text-status-progress' : 'text-hairline'}
                        />
                      ))}
                    </div>
                    {feedback.comment && (
                      <p className="font-body text-sm text-ink/70 mt-2">{feedback.comment}</p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-3">
                    <StarRatingInput value={feedbackRating} onChange={setFeedbackRating} />
                    <Input
                      id="feedback-comment"
                      type="textarea"
                      placeholder="Optional comment"
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      maxLength={300}
                    />
                    {feedbackError && (
                      <p className="text-xs text-status-open">{feedbackError}</p>
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={feedbackSubmitting}
                      className="w-full"
                    >
                      Submit Feedback
                    </Button>
                  </form>
                )}
              </Card>
            )}

          </div>
        </div>
      </div>

      <AnimatePresence>
        {editOpen && (
          <EditReportModal
            key="edit-report"
            report={report}
            onClose={() => setEditOpen(false)}
            onSaved={handleReportEdited}
          />
        )}

        {deleteOpen && (
          <DeleteReportModal
            key="delete-report"
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDeleteReport}
            deleting={deleting}
            error={deleteError}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ReportDetail;