import { useState, useEffect } from 'react';
import { getMyReports } from '../services/api';



function MyReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


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
    }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-body text-ink">Loading your reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <h2 className="font-heading text-2xl font-bold text-ink mb-6">
        My Reports
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4 max-w-2xl">
          {error}
        </div>
      )}

      {reports.length === 0 ? (
        <p className="font-body text-ink">You haven&apos;t submitted any reports yet.</p>
      ) : (
        <div className="grid gap-4 max-w-2xl">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white border border-hairline rounded-lg p-4 flex gap-4"
            >
              <img
                src={report.photoUrl}
                alt={report.category}
                className="w-24 h-24 object-cover rounded"
              />
              <div>
                <p className="font-heading font-bold text-ink capitalize">
                  {report.category}
                </p>
                <p className="font-body text-sm text-ink">
                  {report.description}
                </p>
                <span className="inline-block mt-2 text-xs font-body px-2 py-1 rounded bg-amber text-white capitalize">
                  {report.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

}


export default MyReports;