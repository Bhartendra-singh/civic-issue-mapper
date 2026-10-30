import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  Zap, MapPin, ClipboardList, CheckCircle2, Users,
  RotateCcw, AlertTriangle, Clock, Code2, Mail,
} from 'lucide-react';
import { timeAgo } from '../utils/timeAgo';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { API_URL } from '../services/api';


const GITHUB_URL = 'https://github.com/Bhartendra-singh/civic-issue-mapper';
const CONTACT_EMAIL = 'bhartendradeveloper059@gmail.com';

const CATEGORY_LABELS = {
  pothole: 'Pothole',
  garbage: 'Garbage',
  waterlogging: 'Waterlogging',
  streetlight: 'Streetlight',
  drain: 'Drain',
  other: 'Other',
};


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


function Home() {
  const [stats, setStats] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [accountability, setAccountability] = useState(null);

  const navigate = useNavigate();
  const [quickCategory, setQuickCategory] = useState('pothole');
  const [quickDescription, setQuickDescription] = useState('');

  const handleQuickReport = () => {
    navigate('/submit-report', {
      state: { category: quickCategory, description: quickDescription },
    });
  };

  useEffect(() => {
    fetch(`${API_URL}/reports/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load stats', err));

    fetch(`${API_URL}/reports/public`)
      .then((res) => res.json())
      .then((data) => setAllReports(data.reports))
      .catch((err) => console.error('Failed to load reports', err));

    fetch(`${API_URL}/reports/accountability`)
      .then((res) => res.json())
      .then((data) => setAccountability(data))
      .catch((err) => console.error('Failed to load accountability metrics', err));
  }, []);

  const recentReports = allReports.slice(0, 3);

  const categoryData = useMemo(() => {
    const counts = {};
    allReports.forEach((report) => {
      counts[report.category] = (counts[report.category] || 0) + 1;
    });
    return Object.entries(counts).map(([category, count]) => ({
      category: CATEGORY_LABELS[category] || category,
      count,
    }));
  }, [allReports]);

   const hasEnoughSample = accountability?.sampleSize?.resolvedWithTimestamp >= 5;


     return (
    <div className="min-h-screen bg-navy">

      {/* ── Hero Section ── */}
      <section className="px-6 py-20 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-panel border border-cyan-dim text-cyan text-xs font-semibold tracking-wide px-4 py-1.5 rounded-full">
            <Zap size={14} /> LIVE ISSUE TRACKING
          </span>

          <h1 className="font-heading text-5xl font-bold text-text-primary leading-tight mt-6">
            Report &amp; Track <span className="text-cyan">Civic Issues</span> in Your City
          </h1>

          <p className="font-body text-text-muted text-lg mt-6 max-w-lg">
            See potholes, broken streetlights, garbage dumps, and more on a live map.
            Report issues in seconds and track their resolution.
          </p>

          <div className="flex gap-4 mt-8">
            <Link to="/submit-report">
              <Button variant="primary" size="lg" icon={MapPin}>
                Report an Issue
              </Button>
            </Link>
            <Link to="/map">
              <Button variant="outlineDark" size="lg">
                View Live Map
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-panel border border-cyan-dim rounded-2xl p-5">
          <p className="text-cyan text-xs font-semibold tracking-wide">● LIVE ISSUE MAP</p>

          <div className="relative bg-navy-2 rounded-xl h-64 mt-4 overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              <div className="border-r border-b border-cyan-dim"></div>
              <div className="border-b border-cyan-dim"></div>
              <div className="border-r border-cyan-dim"></div>
              <div></div>
            </div>

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

            {/* ── Live Impact Section ── */}
      <section className="border-t border-cyan-dim px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-text-primary">Live Impact</h2>
          <p className="font-body text-text-muted text-sm mt-1">
            Real numbers, pulled straight from the database — updated as reports come in.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            {[
              { icon: ClipboardList, value: stats?.totalReports, label: 'Issues Reported' },
              { icon: CheckCircle2, value: stats?.resolvedCount, label: 'Issues Resolved' },
              { icon: Users, value: stats?.activeUsers, label: 'Active Citizens' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-center gap-4 bg-panel border border-cyan-dim rounded-xl p-5"
              >
                <div className="w-11 h-11 rounded-lg bg-cyan-dim flex items-center justify-center text-cyan shrink-0">
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="font-heading text-3xl font-bold text-cyan">
                    {item.value ?? '—'}
                  </p>
                  <p className="font-body text-text-muted text-xs mt-0.5">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-6">

            <Card className="!bg-panel !border-cyan-dim" padding="lg">
              <p className="font-heading text-sm font-bold text-text-primary">
                Reports by Category
              </p>
              {categoryData.length === 0 ? (
                <p className="font-body text-text-muted text-xs mt-8 text-center py-8">
                  No reports yet.
                </p>
              ) : (
                <div className="h-56 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#17334a" vertical={false} />
                      <XAxis
                        dataKey="category"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={{ stroke: '#17334a' }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#122a3d',
                          border: '1px solid #22d3ee33',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: '#f1f5f9' }}
                        cursor={{ fill: '#22d3ee1a' }}
                      />
                      <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card className="!bg-panel !border-cyan-dim" padding="lg">
              <p className="font-heading text-sm font-bold text-text-primary">
                Accountability Metrics
              </p>

              {!hasEnoughSample && (
                <p className="font-body text-text-muted text-xs mt-1">
                  Not enough resolved reports yet for reliable numbers — shown for transparency.
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 mt-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-dim flex items-center justify-center text-cyan shrink-0">
                    <RotateCcw size={16} />
                  </div>
                  <div>
                    <p className="font-heading text-xl font-bold text-text-primary">
                      {accountability ? `${accountability.reopenRate}%` : '—'}
                    </p>
                    <p className="font-body text-text-muted text-xs">Reopen Rate</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-dim flex items-center justify-center text-cyan shrink-0">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <p className="font-heading text-xl font-bold text-text-primary">
                      {accountability ? `${accountability.slaBreachRate}%` : '—'}
                    </p>
                    <p className="font-body text-text-muted text-xs">SLA Breach Rate</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-dim flex items-center justify-center text-cyan shrink-0">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="font-heading text-xl font-bold text-text-primary">
                      {accountability ? accountability.medianResolutionDays : '—'}
                      <span className="text-sm font-normal text-text-muted"> days</span>
                    </p>
                    <p className="font-body text-text-muted text-xs">Median Resolution Time</p>
                  </div>
                </div>
              </div>
            </Card>

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
              <Card key={report._id} pulse>
                <div className="flex items-center justify-between">
                  <Badge status="neutral">{CATEGORY_LABELS[report.category] || report.category}</Badge>
                  <Badge status={report.status} />
                </div>

                <h3 className="font-heading text-base font-bold text-ink mt-4">
                  {report.description}
                </h3>

                <div className="flex items-center justify-between border-t border-hairline mt-5 pt-4 text-xs text-ink/50">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {report.location.lat.toFixed(3)}, {report.location.lng.toFixed(3)}
                  </span>
                  <span>{timeAgo(report.createdAt)}</span>
                </div>
              </Card>
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
            {[
              {
                step: 1,
                title: 'Spot the Issue',
                desc: 'See a pothole, broken light, or garbage dump? Open CivicMap and tap Report.',
              },
              {
                step: 2,
                title: 'Drop a Pin',
                desc: 'Mark the exact location on the map, add a photo and short description.',
              },
              {
                step: 3,
                title: 'Track Resolution',
                desc: 'Get notified as the status changes from Open → In Progress → Resolved.',
              },
            ].map((item) => (
              <Card key={item.step} className="!bg-panel !border-cyan-dim" padding="lg">
                <div className="w-12 h-12 rounded-lg border-2 border-cyan-dim text-cyan font-heading font-bold text-xl flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary mt-5">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-text-muted mt-2">
                  {item.desc}
                </p>
              </Card>
            ))}
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

          <Card className="!bg-panel !border-cyan-dim" padding="lg">
            <p className="text-cyan font-heading font-bold flex items-center gap-2">
              <MapPin size={18} /> Quick Report
            </p>

            <label className="block font-body text-xs font-semibold text-text-muted tracking-wide mt-6">
              ISSUE TYPE
            </label>
            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value)}
              className="w-full bg-navy-2 border border-hairline text-text-primary rounded-lg px-4 py-3 mt-2 outline-none focus:border-cyan"
            >
              <option value="pothole">Road / Pothole</option>
              <option value="streetlight">Streetlight</option>
              <option value="garbage">Garbage</option>
              <option value="waterlogging">Waterlogging</option>
              <option value="drain">Drain</option>
              <option value="other">Other</option>
            </select>

            <div className="mt-5">
              <Input
                id="quick-description"
                label="DESCRIPTION"
                value={quickDescription}
                onChange={(e) => setQuickDescription(e.target.value)}
                placeholder="Briefly describe the issue"
                className="!bg-navy-2 !border-hairline !text-text-primary placeholder:!text-text-muted"
              />
            </div>

            <div className="mt-6">
              <Button variant="primary" size="md" icon={Zap} onClick={handleQuickReport} className="w-full">
                Submit Report
              </Button>
            </div>
          </Card>
        </div>
      </section>


            {/* ── Footer ── */}
      <footer className="border-t border-cyan-dim px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

          <p className="font-heading text-lg font-bold text-text-primary">
            Civic<span className="text-cyan">Map</span>
          </p>

          <div className="flex items-center gap-6 font-body text-sm text-text-muted">
            <Link to="/" className="hover:text-cyan transition-colors">Home</Link>
            <Link to="/map" className="hover:text-cyan transition-colors">Map</Link>
            <Link to="/submit-report" className="hover:text-cyan transition-colors">Report Issue</Link>
          </div>

          <div className="flex items-center gap-4">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-text-muted hover:text-cyan transition-colors text-sm">
              <Code2 size={16} /> View Source
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-1.5 text-text-muted hover:text-cyan transition-colors text-sm">
              <Mail size={16} /> Contact
            </a>
          </div>

        </div>

        <p className="text-center font-body text-xs text-text-muted mt-6">
          Making cities better, one report at a time.
        </p>
      </footer>

    </div>
  );
}

export default Home;
