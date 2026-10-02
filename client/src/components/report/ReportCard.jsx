import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ThumbsUp, MessageCircle, RotateCcw, Image as ImageIcon, Link2 } from 'lucide-react';
import { timeAgo } from '../../utils/timeAgo';
import { toggleUpvote, reopenReport, getComments } from '../../services/api';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const CATEGORY_LABELS = {
  pothole: 'Pothole',
  garbage: 'Garbage',
  waterlogging: 'Waterlogging',
  streetlight: 'Streetlight',
  drain: 'Drain',
  other: 'Other',
};

const REOPEN_WINDOW_DAYS = 7;

function canReopen(report) {
  if (report.status !== 'resolved') return false;
  if (report.hasBeenReopened) return false;
  if (!report.resolvedAt) return false;
  const daysSinceResolved =
    (Date.now() - new Date(report.resolvedAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceResolved <= REOPEN_WINDOW_DAYS;
}

export default function ReportCard({ report, onReportUpdate, initiallyUpvoted = false }) {
  const navigate = useNavigate();

  const [upvoteCount, setUpvoteCount] = useState(report.upvoteCount ?? 0);
  const [isUpvoted, setIsUpvoted] = useState(initiallyUpvoted);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(null);
  const [reopenLoading, setReopenLoading] = useState(false);

  const upvoteInFlight = useRef(false);

  useEffect(() => {
    getComments(report._id)
      .then((data) => setCommentCount(data.comments?.length ?? data.length ?? 0))
      .catch(() => setCommentCount(null));
  }, [report._id]);

  const handleUpvote = async () => {
    if (upvoteInFlight.current) return;
    upvoteInFlight.current = true;
    setUpvoteLoading(true);

    const previousIsUpvoted = isUpvoted;
    const previousCount = upvoteCount;

    setIsUpvoted(!previousIsUpvoted);
    setUpvoteCount(previousIsUpvoted ? previousCount - 1 : previousCount + 1);

    try {
      const data = await toggleUpvote(report._id);
      setIsUpvoted(data.upvoted);
      setUpvoteCount(data.upvoted ? previousCount + 1 : previousCount - 1);
    } catch (err) {
      setIsUpvoted(previousIsUpvoted);
      setUpvoteCount(previousCount);
    } finally {
      setUpvoteLoading(false);
      upvoteInFlight.current = false;
    }
  };

  const handleReopen = async () => {
    setReopenLoading(true);
    try {
      const data = await reopenReport(report._id);
      onReportUpdate?.(data.report ?? { ...report, status: 'reopened', hasBeenReopened: true });
    } catch (err) {
      console.error('Failed to reopen report', err);
    } finally {
      setReopenLoading(false);
    }
  };

  const thumbnail = report.photoUrls?.[0]?.url;

  return (
    <Card
      pulse
      padding="none"
      className="overflow-hidden cursor-pointer"
      onClick={() => navigate(`/reports/${report._id}`)}
    >
      <div className="aspect-video w-full bg-panel flex items-center justify-center overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={report.category} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={28} className="text-text-muted" />
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <Badge status="neutral">{CATEGORY_LABELS[report.category] || report.category}</Badge>
          <Badge status={report.status} />
        </div>


        {report.clusterId && (
          <div className="flex items-center gap-1.5 text-xs text-cyan font-semibold mt-2">
            <Link2 size={12} />
            Similar reports found nearby
          </div>
        )}

        <p className="font-body text-sm text-ink mt-3">{report.description}</p>

        <div className="flex items-center justify-between border-t border-hairline mt-4 pt-3 text-xs text-ink/50">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {report.location.lat.toFixed(3)}, {report.location.lng.toFixed(3)}
          </span>
          <span>{timeAgo(report.createdAt)}</span>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpvote();
            }}
            disabled={upvoteLoading}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              isUpvoted
                ? 'bg-cyan-dim border-cyan text-cyan'
                : 'border-hairline text-ink/60 hover:border-cyan hover:text-cyan'
            }`}
          >
            <ThumbsUp size={13} /> {upvoteCount}
          </button>

          <span className="flex items-center gap-1.5 text-xs text-ink/50">
            <MessageCircle size={13} /> {commentCount ?? '—'}
          </span>

          {canReopen(report) && (
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              loading={reopenLoading}
              onClick={(e) => {
                e.stopPropagation();
                handleReopen();
              }}
              className="ml-auto !text-xs"
            >
              Reopen
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}