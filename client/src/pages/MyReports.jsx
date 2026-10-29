import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Loader2, AlertTriangle, Plus } from 'lucide-react';
import { getMyReports, getMyUpvotedReportIds } from '../services/api';
import { connectSocket } from '../services/socket';
import Button from '../components/ui/Button';
import ReportCard from '../components/report/ReportCard';

function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upvotedIds, setUpvotedIds] = useState(new Set());

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const progressCount = reports.filter((r) => r.status === 'in-progress').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved' || r.status === 'reopened').length;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getMyReports();
        setReports(data.reports);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();

    getMyUpvotedReportIds()
      .then((data) => setUpvotedIds(new Set(data.reportIds)))
      .catch(() => setUpvotedIds(new Set()));
  }, []);

  useEffect(() => {
    const socket = connectSocket();

    const handleReportUpdated = ({ _id, status, clusterId, resolvedAt, hasBeenReopened }) => {
      setReports((prev) =>
        prev.map((r) =>
          r._id === _id ? { ...r, status, clusterId, resolvedAt, hasBeenReopened } : r
        )
      );
    };

    const handleReportDeleted = ({ _id }) => {
      setReports((prev) => prev.filter((r) => r._id !== _id));
    };

    socket.on('report:updated', handleReportUpdated);
    socket.on('report:deleted', handleReportDeleted);

    return () => {
      socket.off('report:updated', handleReportUpdated);
      socket.off('report:deleted', handleReportDeleted);
    };
  }, []);

  const handleReportUpdate = (updatedReport) => {
    setReports((prev) =>
      prev.map((r) => (r._id === updatedReport._id ? updatedReport : r))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-cyan animate-spin" />
          <p className="font-body text-ink/60 text-sm">Loading your reports...</p>
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
              My Reports
            </h2>
            <p className="font-body text-sm text-text-muted mt-1">
              Track every issue you've reported, from submission to resolution.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-panel border border-cyan-dim rounded-xl px-5 py-3 min-w-[90px]">
              <p className="font-heading text-2xl font-bold text-cyan">{reports.length}</p>
              <p className="font-body text-xs text-text-muted mt-0.5">Total</p>
            </div>
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

      {/* ── Light Content Section ── */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="flex justify-end mb-6">
          <Link to="/submit-report">
            <Button variant="primary" size="md" icon={Plus}>
              New Report
            </Button>
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-status-open-bg border border-status-open/30 text-status-open text-sm rounded-lg px-4 py-3 mb-6 max-w-2xl">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center bg-white border border-hairline rounded-2xl py-20 px-6">
            <div className="w-16 h-16 rounded-full bg-cyan-dim flex items-center justify-center">
              <Inbox size={28} className="text-cyan" />
            </div>
            <h3 className="font-heading text-lg font-bold text-ink mt-4">
              No reports yet
            </h3>
            <p className="font-body text-sm text-ink/60 mt-1 max-w-sm">
              You haven't submitted any issues. Spotted a pothole or a broken streetlight? Report it now.
            </p>
            <Link to="/submit-report" className="mt-5">
              <Button variant="primary" size="md" icon={Plus}>
                Submit Your First Report
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                onReportUpdate={handleReportUpdate}
                initiallyUpvoted={upvotedIds.has(report._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyReports;