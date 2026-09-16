// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';

// function Home() {

//     const [stats, setStats] = useState(null);
//     const [recentReports, setRecentReports] = useState([]);


//     useEffect(() => {
//         fetch('http://localhost:5000/api/reports/analytics', {
//             credentials: 'include',
//         })

//         .then((res) => res.json())
//         .then((data) => setStats(data))
//         .catch((err) => console.error('Failed to load stats', err));
//     }, []);


//   return (
//     <div className="min-h-screen bg-navy">

//       {/* ── Hero Section ── */}
//       <section className="px-6 py-20 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

//         <div>
//           <span className="inline-block bg-panel border border-cyan-dim text-cyan text-xs font-semibold tracking-wide px-4 py-1.5 rounded-full">
//             ⚡ LIVE ISSUE TRACKING
//           </span>

//           <h1 className="font-heading text-5xl font-bold text-text-primary leading-tight mt-6">
//             Report &amp; Track <span className="text-cyan">Civic Issues</span> in Your City
//           </h1>

//           <p className="font-body text-text-muted text-lg mt-6 max-w-lg">
//             See potholes, broken streetlights, garbage dumps, and more on a live map.
//             Report issues in seconds and track their resolution.
//           </p>

//           <div className="flex gap-4 mt-8">
//             <Link
//               to="/submit-report"
//               className="bg-cyan text-navy font-semibold px-6 py-3 rounded-lg hover:bg-cyan/90 transition-colors"
//             >
//               📍 Report an Issue
//             </Link>
//             <Link
//               to="/map"
//               className="border border-hairline text-text-primary font-semibold px-6 py-3 rounded-lg hover:bg-panel transition-colors"
//             >
//               View Live Map
//             </Link>
//           </div>
//         </div>

//         <div className="bg-panel border border-cyan-dim rounded-2xl p-5">
//           <p className="text-cyan text-xs font-semibold tracking-wide">● LIVE ISSUE MAP</p>
//           <div className="bg-navy-2 rounded-xl h-64 mt-4"></div>
//         </div>

//       </section>


//             {/* ── Stats Section ── */}
//       <section className="border-t border-cyan-dim px-6 py-14">
//         <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">

//           <div>
//             <p className="font-heading text-4xl font-bold text-cyan">
//               {stats ? stats.totalReports : '—'}
//             </p>
//             <p className="font-body text-text-muted text-sm mt-1">Issues Reported</p>
//           </div>

//           <div>
//             <p className="font-heading text-4xl font-bold text-cyan">
//               {stats ? stats.resolvedCount : '—'}
//             </p>
//             <p className="font-body text-text-muted text-sm mt-1">Issues Resolved</p>
//           </div>

//           <div>
//             <p className="font-heading text-4xl font-bold text-cyan">
//               {stats ? stats.activeUsers : '—'}
//             </p>
//             <p className="font-body text-text-muted text-sm mt-1">Active Citizens</p>
//           </div>

//           <div>
//             <p className="font-heading text-4xl font-bold text-cyan">
//               {stats ? stats.wardsCovered : '—'}
//             </p>
//             <p className="font-body text-text-muted text-sm mt-1">Wards Covered</p>
//           </div>

//         </div>
//       </section>


//     </div>
//   );
// }

// export default Home;



import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { timeAgo } from '../utils/timeAgo';


function MapPinIcon({ className = '', style = {} }) {
  return (
    <svg
      className={`w-7 h-7 fill-current drop-shadow-md ${className}`}
      style={style}
      viewBox="0 0 24 24"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" fill="#0B1626" />
    </svg>
  );
}

// function timeAgo(dateString) {
//   const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);

//   if (seconds < 60) return 'Just now';

//   const minutes = Math.floor(seconds / 60);
//   if (minutes < 60) return `${minutes} min ago`;

//   const hours = Math.floor(minutes / 60);
//   if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;

//   const days = Math.floor(hours / 24);
//   return `${days} day${days > 1 ? 's' : ''} ago`;
// }


function Home() {

    const [stats, setStats] = useState(null);
    const [recentReports, setRecentReports] = useState([]);

    const navigate = useNavigate();
    const [quickCategory, setQuickCategory] = useState('pothole');
    const [quickDescription, setQuickDescription] = useState('');


    const handleQuickReport = () => {
        navigate('/submit-report', {
            state: {
                category: quickCategory,
                description: quickDescription,
            },
        });
    };

    useEffect(() => {
        fetch('http://localhost:5000/api/reports/stats')
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch((err) => console.error('Failed to load stats', err));

        fetch('http://localhost:5000/api/reports/public')
            .then((res) => res.json())
            .then((data) => setRecentReports(data.reports.slice(0, 3)))
            .catch((err) => console.error('Failed to load reports', err));
    }, []);

  return (
    <div className="min-h-screen bg-navy">

      {/* ── Hero Section ── */}
      <section className="px-6 py-20 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        <div>
          <span className="inline-block bg-panel border border-cyan-dim text-cyan text-xs font-semibold tracking-wide px-4 py-1.5 rounded-full">
            ⚡ LIVE ISSUE TRACKING
          </span>

          <h1 className="font-heading text-5xl font-bold text-text-primary leading-tight mt-6">
            Report &amp; Track <span className="text-cyan">Civic Issues</span> in Your City
          </h1>

          <p className="font-body text-text-muted text-lg mt-6 max-w-lg">
            See potholes, broken streetlights, garbage dumps, and more on a live map.
            Report issues in seconds and track their resolution.
          </p>

          <div className="flex gap-4 mt-8">
            <Link
              to="/submit-report"
              className="bg-cyan text-navy font-semibold px-6 py-3 rounded-lg hover:bg-cyan/90 transition-colors"
            >
              📍 Report an Issue
            </Link>
            <Link
              to="/map"
              className="border border-hairline text-text-primary font-semibold px-6 py-3 rounded-lg hover:bg-panel transition-colors"
            >
              View Live Map
            </Link>
          </div>
        </div>

        <div className="bg-panel border border-cyan-dim rounded-2xl p-5">
          <p className="text-cyan text-xs font-semibold tracking-wide">● LIVE ISSUE MAP</p>

        <div className="relative bg-navy-2 rounded-xl h-64 mt-4 overflow-hidden">
           {/* Grid background lines */}
           <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
             <div className="border-r border-b border-cyan-dim"></div>
             <div className="border-b border-cyan-dim"></div>
             <div className="border-r border-cyan-dim"></div>
             <div></div>
           </div>

           {/* Pins */}
           <MapPinIcon className="absolute text-status-open" style={{ top: '38%', left: '30%' }} />
           <MapPinIcon className="absolute text-status-resolved" style={{ top: '20%', left: '75%' }} />
           <MapPinIcon className="absolute text-cyan" style={{ top: '62%', left: '15%' }} />
           <MapPinIcon className="absolute text-status-progress" style={{ top: '58%', left: '68%' }} />
         </div>

         <div className="flex items-center gap-5 mt-4 text-xs font-body text-text-muted">
           <span className="flex items-center gap-1.5">
             <span className="w-2 h-2 rounded-full bg-status-open"></span> Open
           </span>
           <span className="flex items-center gap-1.5">
             <span className="w-2 h-2 rounded-full bg-status-progress"></span> In Progress
           </span>
           <span className="flex items-center gap-1.5">
             <span className="w-2 h-2 rounded-full bg-status-resolved"></span> Resolved
           </span>
          </div>

        </div>

      </section>

      {/* ── Stats Section ── */}
      <section className="border-t border-cyan-dim px-6 py-14">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8">

          <div>
            <p className="font-heading text-4xl font-bold text-cyan">
              {stats ? stats.totalReports : '—'}
            </p>
            <p className="font-body text-text-muted text-sm mt-1">Issues Reported</p>
          </div>

          <div>
            <p className="font-heading text-4xl font-bold text-cyan">
              {stats ? stats.resolvedCount : '—'}
            </p>
            <p className="font-body text-text-muted text-sm mt-1">Issues Resolved</p>
          </div>

          <div>
            <p className="font-heading text-4xl font-bold text-cyan">
              {stats ? stats.activeUsers : '—'}
            </p>
            <p className="font-body text-text-muted text-sm mt-1">Active Citizens</p>
          </div>

        </div>
      </section>

      {/* ── Recent Issues Section ── */}
      
      <section className="bg-light px-6 py-20">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-end justify-between">
            <h2 className="font-heading text-3xl font-bold text-ink">Recent Issues</h2>
            <Link to="/map" className="font-body text-cyan font-semibold hover:text-cyan/80 transition-colors">
              See all issues →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {recentReports.map((report) => (
              <div key={report._id} className="bg-white border border-hairline rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <span className="bg-cyan-dim text-cyan text-xs font-semibold px-3 py-1 rounded-full uppercase">
                    {report.category}
                  </span>
                  <span
                    className={
                      report.status === 'resolved'
                        ? 'bg-status-resolved-bg text-status-resolved text-xs font-semibold px-3 py-1 rounded-full'
                        : report.status === 'in-progress'
                        ? 'bg-status-progress-bg text-status-progress text-xs font-semibold px-3 py-1 rounded-full'
                        : 'bg-status-open-bg text-status-open text-xs font-semibold px-3 py-1 rounded-full'
                    }
                  >
                    {report.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-heading text-base font-bold text-ink mt-4">
                  {report.description}
                </h3>

                <div className="flex items-center justify-between border-t border-hairline mt-5 pt-4 text-xs text-ink/50">
                  <span>📍 {report.location.lat.toFixed(3)}, {report.location.lng.toFixed(3)}</span>
                  <span>{timeAgo(report.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

            {/* ── How It Works Section ── */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">

          <h2 className="font-heading text-3xl font-bold text-text-primary">
            How It Works
          </h2>
          <p className="font-body text-text-muted mt-2">
            Three simple steps to report a civic issue
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-10">

            <div className="bg-panel border border-cyan-dim rounded-xl p-8">
              <div className="w-12 h-12 rounded-lg border-2 border-cyan-dim text-cyan font-heading font-bold text-xl flex items-center justify-center">
                1
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mt-5">
                Spot the Issue
              </h3>
              <p className="font-body text-sm text-text-muted mt-2">
                See a pothole, broken light, or garbage dump? Open CivicMap and tap Report.
              </p>
            </div>

            <div className="bg-panel border border-cyan-dim rounded-xl p-8">
              <div className="w-12 h-12 rounded-lg border-2 border-cyan-dim text-cyan font-heading font-bold text-xl flex items-center justify-center">
                2
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mt-5">
                Drop a Pin
              </h3>
              <p className="font-body text-sm text-text-muted mt-2">
                Mark the exact location on the map, add a photo and short description.
              </p>
            </div>

            <div className="bg-panel border border-cyan-dim rounded-xl p-8">
              <div className="w-12 h-12 rounded-lg border-2 border-cyan-dim text-cyan font-heading font-bold text-xl flex items-center justify-center">
                3
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mt-5">
                Track Resolution
              </h3>
              <p className="font-body text-sm text-text-muted mt-2">
                Get notified as the status changes from Open → In Progress → Resolved.
              </p>
            </div>

          </div>

        </div>
      </section>

            {/* ── Quick Report CTA Section ── */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="font-heading text-4xl font-bold text-text-primary leading-tight">
              Spotted an issue? <span className="text-cyan">Report it now.</span>
            </h2>
            <p className="font-body text-text-muted text-lg mt-5 max-w-md">
              Takes less than a minute. Add a photo, drop a pin on the map, and let the
              authorities know. Together we make our city better.
            </p>
          </div>

          <div className="bg-panel border border-cyan-dim rounded-2xl p-8">
            <p className="text-cyan font-heading font-bold">📍 Quick Report</p>

            <label className="block font-body text-xs font-semibold text-text-muted tracking-wide mt-6">
              ISSUE TYPE
            </label>
            <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value)}
                className="w-full bg-navy-2 border border-hairline text-text-primary rounded-lg px-4 py-3 mt-2 outline-none focus:border-cyan"
            >
              <option value="pothole">🕳️ Road / Pothole</option>
              <option value="streetlight">💡 Streetlight</option>
              <option value="garbage">🗑️ Garbage</option>
              <option value="waterlogging">💧 Waterlogging</option>
              <option value="drain">🚰 Drain</option>
              <option value="other">⚠️ Other</option>
            </select>

            <label className="block font-body text-xs font-semibold text-text-muted tracking-wide mt-5">
              DESCRIPTION
            </label>
            <input
              type="text"
              value={quickDescription}
              onChange={(e) => setQuickDescription(e.target.value)}
              placeholder="Briefly describe the issue"
              className="w-full bg-navy-2 border border-hairline text-text-primary placeholder:text-text-muted rounded-lg px-4 py-3 mt-2 outline-none focus:border-cyan"
            />

            <button
              onClick={handleQuickReport}
              className="w-full bg-cyan text-navy font-heading font-bold rounded-lg py-3 mt-6 hover:bg-cyan/90 transition-colors"
            >
              ⚡ Submit Report
            </button>

          </div>

        </div>
      </section>

            {/* ── Footer ── */}
      <footer className="border-t border-cyan-dim px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="font-heading text-lg font-bold text-text-primary">
            Civic<span className="text-cyan">Map</span>
          </p>
          <p className="font-body text-sm text-text-muted">
            Making cities better, one report at a time.
          </p>
        </div>
      </footer>

    </div>
  );
}

export default Home;