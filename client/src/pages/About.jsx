import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera, BarChart3, CheckCircle2, RotateCcw,
  Layers, Tags, Gauge, BellRing, ShieldCheck, Bot, ExternalLink,
} from 'lucide-react';
import { getButtonClasses } from '../components/ui/Button';

const GITHUB_URL = 'https://github.com/Bhartendra-singh/civic-issue-mapper';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

const PROBLEM_STATS = [
  {
    value: '9,438',
    label: 'pothole-related deaths in India, 2020–2024',
    source: 'MoRTH, Road Accidents in India',
  },
  {
    value: '~28%',
    label: 'of urban sewage is actually treated',
    source: 'CPCB, National Inventory of STPs (2021)',
  },
  {
    value: '30 → 48',
    label: 'days: Mumbai average resolution time rose while complaints fell',
    source: 'Praja Foundation',
  },
  {
    value: '48 hrs',
    label: 'legal limit to fix a reported pothole',
    source: 'Bombay High Court, Oct 2025',
  },
];

const STEPS = [
  {
    icon: Camera,
    title: 'Report',
    text: 'Snap up to 4 photos, location is captured automatically. Our ML model suggests the category, even for Hinglish text.',
  },
  {
    icon: BarChart3,
    title: 'Prioritize',
    text: 'Upvotes, DBSCAN clustering and a priority score push the most urgent issues to the top and merge duplicates.',
  },
  {
    icon: CheckCircle2,
    title: 'Resolve',
    text: 'Reports are auto-routed to the right department with an SLA. Overdue issues trigger alerts to admins.',
  },
  {
    icon: RotateCcw,
    title: 'Reopen',
    text: 'Not actually fixed? Reopen within 7 days. Reopen rate is public, so fake resolutions get exposed.',
  },
];

const FEATURES = [
  {
    icon: Layers,
    title: 'Duplicate detection',
    text: 'Crowd upvotes plus DBSCAN geospatial clustering group the same issue reported many times.',
  },
  {
    icon: Tags,
    title: 'ML category suggestion',
    text: 'A TF-IDF + Naive Bayes classifier suggests the category from your description, in English and Hinglish.',
  },
  {
    icon: Gauge,
    title: 'Priority scoring',
    text: 'A rule-based score combines category, upvotes and age so critical issues surface first.',
  },
  {
    icon: BellRing,
    title: 'SLA auto-alerts',
    text: 'A daily check finds reports that crossed their department SLA and notifies admins once, with no spam.',
  },
  {
    icon: ShieldCheck,
    title: 'Public accountability',
    text: 'Reopen rate, SLA breach rate and median resolution time are computed live from real data.',
  },
  {
    icon: Bot,
    title: 'RAG assistant',
    text: 'Ask questions in plain language. Admins see all data, citizens only their own reports.',
  },
];

const TECH = [
  'React (Vite)', 'Tailwind CSS', 'Framer Motion', 'Leaflet + MapTiler',
  'Node.js + Express', 'MongoDB Atlas', 'Redis', 'JWT + Google OAuth',
  'Cloudinary', 'Python FastAPI', 'scikit-learn', 'Gemini API',
];

function About() {
  return (
    <div>

      {/* ── 1. Hero (dark) ── */}
      <section
        className="bg-navy px-6 py-24 relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(rgba(34,211,238,0.10) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan opacity-10 blur-3xl pointer-events-none"></div>

        <motion.div {...fadeUp} className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="font-body text-sm font-semibold text-cyan tracking-widest uppercase">
            About CivicMap
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-text-primary leading-tight mt-4">
            Report civic issues. <span className="text-cyan">Track real resolutions.</span>
          </h1>
          <p className="font-body text-text-muted mt-5 text-lg">
            CivicMap helps citizens report problems like potholes, garbage and waterlogging, and holds
            the system accountable until they are actually fixed.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link to="/submit-report" className={getButtonClasses({ variant: 'primary', size: 'lg' })}>
              Report an Issue
            </Link>
            <Link to="/map" className={getButtonClasses({ variant: 'outlineDark', size: 'lg' })}>
              View Map
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── 2. The Problem (light) ── */}
      <section className="bg-light px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="font-body text-sm font-semibold text-cyan tracking-widest uppercase">
              The Problem
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink mt-3">
              The real problem isn't reporting. It's resolution.
            </h2>
            <p className="font-body text-ink/60 mt-4">
              India already has apps to file complaints. What is missing is the capacity and
              accountability to close them, and the numbers show the cost.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {PROBLEM_STATS.map((stat, i) => (
              <motion.div
                key={stat.value}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className="bg-white border border-hairline rounded-2xl p-6 shadow-sm hover:bg-cyan/10 hover:border-cyan/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <p className="font-heading text-4xl font-bold text-navy">{stat.value}</p>
                <p className="font-body text-sm text-ink mt-3">{stat.label}</p>
                <p className="font-body text-xs text-ink/40 mt-4 pt-3 border-t border-hairline">
                  Source: {stat.source}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. How It Works (dark) ── */}
      <section className="bg-navy px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
            <p className="font-body text-sm font-semibold text-cyan tracking-widest uppercase">
              How It Works
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mt-3">
              From a photo to a closed loop
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                  className="bg-panel border border-cyan-dim rounded-2xl p-6 hover:bg-panel-light transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-navy border border-cyan-dim flex items-center justify-center">
                      <Icon size={20} className="text-cyan" />
                    </div>
                    <span className="font-heading text-3xl font-bold text-cyan/20">0{i + 1}</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-text-primary mt-5">{step.title}</h3>
                  <p className="font-body text-sm text-text-muted mt-2">{step.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. What Makes It Different (light) ── */}
      <section className="bg-light px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="font-body text-sm font-semibold text-cyan tracking-widest uppercase">
              What Makes It Different
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink mt-3">
              Built for resolution, not just reporting
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: (i % 3) * 0.1 }}
                  className="bg-white border border-hairline rounded-2xl p-6 shadow-sm hover:bg-cyan/10 hover:border-cyan/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-navy flex items-center justify-center">
                    <Icon size={20} className="text-cyan" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-ink mt-4">{f.title}</h3>
                  <p className="font-body text-sm text-ink/60 mt-2">{f.text}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            {...fadeUp}
            className="mt-8 bg-cyan-dim/40 border border-cyan/30 rounded-xl px-5 py-4"
          >
            <p className="font-body text-sm text-ink">
              <span className="font-semibold">On the roadmap:</span> semantic vector search for the
              assistant, and real-time updates with Socket.io. These are not built yet.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 5. Tech Stack (dark) ── */}
      <section className="bg-navy px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <p className="font-body text-sm font-semibold text-cyan tracking-widest uppercase">
              Tech Stack
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mt-3">
              A modular monolith with one ML microservice
            </h2>
            <p className="font-body text-text-muted mt-4 max-w-2xl mx-auto">
              A MERN backend organised by feature, plus a dedicated Python service where machine
              learning genuinely needs it.
            </p>
          </motion.div>

          <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-3 mt-10">
            {TECH.map((t) => (
              <span
                key={t}
                className="font-body text-sm text-text-primary bg-panel border border-cyan-dim rounded-full px-4 py-2"
              >
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 6. Built By (light) ── */}
      <section className="bg-light px-6 py-20">
        <motion.div
          {...fadeUp}
          className="max-w-xl mx-auto bg-white border border-hairline rounded-3xl shadow-xl overflow-hidden text-center"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan via-cyan-deep to-navy"></div>
          <div className="p-8">
            <p className="font-body text-sm font-semibold text-cyan tracking-widest uppercase">
              Built By
            </p>
            <h2 className="font-heading text-2xl font-bold text-ink mt-3">Bhartendra Singh</h2>
            <p className="font-body text-sm text-ink/60 mt-2">
              B.Tech CSE Major Project
              <br />
              Graphic Era Deemed to be University, Dehradun
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={getButtonClasses({ variant: 'primary', size: 'md' })}
              >
                <ExternalLink size={16} /> View on GitHub
              </a>
            <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-cyan px-5 py-2.5 font-body text-sm font-semibold text-ink hover:bg-cyan-dim/30 transition-colors"
            >
                Contact
            </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}

export default About;