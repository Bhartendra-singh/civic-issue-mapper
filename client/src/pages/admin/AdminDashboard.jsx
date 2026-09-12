import { useState, useEffect } from "react";
import { getAllReports, updateReportStatus } from '../../services/api';


const statusColors = {
    pending: 'bg-rust',
    'in-progress': 'bg-amber',
    resolved: 'bg-moss',
};

function AdminDashboard() {

    console.log('AdminDashboard rendering'); 

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const data = await getAllReports();
            setReports(data.reports);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            await updateReportStatus(reportId, newStatus);
            setReports((prevReports) => 
                prevReports.map((r) =>
                    r._id === reportId ? { ...r, status: newStatus } : r 
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-body text-ink">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <h2 className="font-heading text-2xl font-bold text-ink mb-6">
        Admin Dashboard
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <div className="bg-white border border-hairline rounded-lg overflow-hidden">
        <table className="w-full font-body text-sm">
          <thead className="bg-paper border-b border-hairline">
            <tr>
              <th className="text-left px-4 py-3 text-ink">Photo</th>
              <th className="text-left px-4 py-3 text-ink">Category</th>
              <th className="text-left px-4 py-3 text-ink">Description</th>
              <th className="text-left px-4 py-3 text-ink">Reported By</th>
              <th className="text-left px-4 py-3 text-ink">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id} className="border-b border-hairline">
                <td className="px-4 py-3">
                  <img
                    src={report.photoUrl}
                    alt={report.category}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-3 text-ink capitalize">
                  {report.category}
                </td>
                <td className="px-4 py-3 text-ink max-w-xs truncate">
                  {report.description}
                </td>
                <td className="px-4 py-3 text-ink">
                  {report.user?.name || 'Unknown'}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={report.status}
                    onChange={(e) => handleStatusChange(report._id, e.target.value)}
                    className={`text-white text-xs rounded px-2 py-1 capitalize ${statusColors[report.status]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default AdminDashboard;