import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft, MapPin, ThumbsUp, MessageCircle, RotateCcw, Star,
  Loader2, AlertTriangle, Image as ImageIcon, Send, Trash2, Link2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/timeAgo';
import {
  getReportById, toggleUpvote, reopenReport,
  getComments, postComment, deleteComment,
  getFeedback, submitFeedback, getMyUpvotedReportIds, getReportsByCluster
} from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const CATEGORY_LABELS = {
  pothole: 'Pothole', garbage: 'Garbage', waterlogging: 'Waterlogging',
  streetlight: 'Streetlight', drain: 'Drain', other: 'Other',
};

const REOPEN_WINDOW_DAYS = 7;

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

function ReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);

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

  const isOwner = report && user && String(report.user) === String(user._id || user.id);

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
      setReport(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setReopenLoading(false);
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
      setComments((prev) => [data.comment, ...prev]);
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
      <div className="max-w-5xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-6">

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
            <p className="font-body text-sm text-ink/80 leading-relaxed">{report.description}</p>
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
                  const canDelete = user && (String(c.user?._id) === String(user._id || user.id) || user.role === 'admin');
                  return (
                    <div key={c._id} className="flex items-start justify-between gap-3 border-t border-hairline pt-4">
                      <div>
                        <p className="font-body text-sm font-semibold text-ink">{c.user?.name || 'Unknown'}</p>
                        <p className="font-body text-sm text-ink/70 mt-0.5">{c.text}</p>
                        <p className="font-body text-xs text-ink/40 mt-1">{timeAgo(c.createdAt)}</p>
                      </div>
                      {canDelete && (
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
  );
}

export default ReportDetail;