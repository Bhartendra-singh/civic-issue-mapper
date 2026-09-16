// import { useState, useEffect } from 'react';
// import { getMyReports } from '../services/api';



// function MyReports() {
//     const [reports, setReports] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');


//     useEffect(() => {
//         const fetchReports = async () => {
//             try {
//                 const data = await getMyReports();
//                 setReports(data.reports);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchReports();
//     }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-paper flex items-center justify-center">
//         <p className="font-body text-ink">Loading your reports...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-paper px-6 py-10">
//       <h2 className="font-heading text-2xl font-bold text-ink mb-6">
//         My Reports
//       </h2>

//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4 max-w-2xl">
//           {error}
//         </div>
//       )}

//       {reports.length === 0 ? (
//         <p className="font-body text-ink">You haven&apos;t submitted any reports yet.</p>
//       ) : (
//         <div className="grid gap-4 max-w-2xl">
//           {reports.map((report) => (
//             <div
//               key={report._id}
//               className="bg-white border border-hairline rounded-lg p-4 flex gap-4"
//             >
//               <img
//                 src={report.photoUrl}
//                 alt={report.category}
//                 className="w-24 h-24 object-cover rounded"
//               />
//               <div>
//                 <p className="font-heading font-bold text-ink capitalize">
//                   {report.category}
//                 </p>
//                 <p className="font-body text-sm text-ink">
//                   {report.description}
//                 </p>
//                 <span className="inline-block mt-2 text-xs font-body px-2 py-1 rounded bg-amber text-white capitalize">
//                   {report.status}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );

// }


// export default MyReports;



import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Inbox, Loader2, AlertTriangle, MapPin, Plus, ClipboardList } from 'lucide-react';
import { getMyReports } from '../services/api';
import { timeAgo } from '../utils/timeAgo';

const statusStyles = {
    pending: 'bg-status-open-bg text-status-open',
    'in-progress': 'bg-status-progress-bg text-status-progress',
    resolved: 'bg-status-resolved-bg text-status-resolved',
};

function MyReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    const pendingCount = reports.filter((r) => r.status === 'pending').length;
    const progressCount = reports.filter((r) => r.status === 'in-progress').length;
    const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

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
            <div className="min-h-screen bg-light flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-cyan animate-spin" />
                    <p className="font-body text-ink/60 text-sm">Loading your reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light px-6 py-14">
            <div className="max-w-6xl mx-auto">

                <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
                    <div>
                        <span className="inline-block bg-cyan-dim text-cyan text-xs font-semibold px-3 py-1 rounded-full">
                            YOUR REPORTS
                        </span>
                        <h2 className="font-heading text-3xl font-bold text-ink mt-3">
                            My Reports
                        </h2>
                        <p className="font-body text-sm text-ink/60 mt-1">
                            Track every issue you've reported, from submission to resolution.
                        </p>
                    </div>

                    <Link
                        to="/submit-report"
                        className="flex items-center gap-2 bg-cyan text-navy font-heading font-bold px-5 py-2.5 rounded-lg hover:bg-cyan/90 transition-colors"
                    >
                        <Plus size={18} /> New Report
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
                        <Link
                            to="/submit-report"
                            className="flex items-center gap-2 bg-cyan text-navy font-heading font-bold px-5 py-2.5 rounded-lg mt-5 hover:bg-cyan/90 transition-colors"
                        >
                            <Plus size={18} /> Submit Your First Report
                        </Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((report, i) => (
                            <motion.div
                                key={report._id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: i * 0.05 }}
                                whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
                                className="group bg-white border border-hairline rounded-2xl overflow-hidden hover:shadow-xl hover:border-cyan-dim transition-shadow"
                            >
                                <div className="aspect-video w-full overflow-hidden bg-panel">
                                    <img
                                        src={report.photoUrl}
                                        alt={report.category}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>

                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <span className="bg-cyan-dim text-cyan text-xs font-semibold px-3 py-1 rounded-full uppercase">
                                            {report.category}
                                        </span>
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase ${statusStyles[report.status]}`}>
                                            {report.status}
                                        </span>
                                    </div>

                                    <p className="font-body text-sm text-ink mt-3">
                                        {report.description}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-hairline mt-4 pt-3 text-xs text-ink/50">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={12} className="text-pin" />
                                            {report.location.lat.toFixed(3)}, {report.location.lng.toFixed(3)}
                                        </span>
                                        <span>{timeAgo(report.createdAt)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyReports;