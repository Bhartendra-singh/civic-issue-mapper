import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, MapPin, Users, Bell } from 'lucide-react';
import { signupUser, API_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';


function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.53 5.53 0 01-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.66z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.88-3a7.15 7.15 0 01-4.05 1.15c-3.11 0-5.75-2.1-6.69-4.93H1.3v3.1A12 12 0 0012 24z" />
      <path fill="#FBBC05" d="M5.31 14.31A7.2 7.2 0 014.9 12c0-.8.14-1.58.4-2.31v-3.1H1.3A12 12 0 000 12c0 1.94.46 3.77 1.3 5.4z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 001.3 6.59l4.01 3.1C6.25 6.86 8.89 4.77 12 4.77z" />
    </svg>
  );
}

function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await signupUser(formData.name, formData.email, formData.password);
      login(data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Left Panel — Dark Branding ── */}
      <div
        className="bg-navy px-10 py-14 hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(rgba(34,211,238,0.10) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      >
        <div className="relative z-10">
          <p className="font-heading text-xl font-bold text-text-primary">
            Civic<span className="text-cyan">Map</span>
          </p>

          <h1 className="font-heading text-4xl font-bold text-text-primary leading-tight mt-10">
            Join the <span className="text-cyan">movement.</span>
          </h1>
          <p className="font-body text-text-muted mt-4 max-w-sm">
            Create an account to report civic issues, track their resolution, and help build a better city.
          </p>
        </div>

        <div className="relative z-10 flex-1 min-h-[260px] flex items-center justify-center">
          <div className="absolute w-56 h-56 rounded-full bg-cyan opacity-10 blur-3xl"></div>

          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-24 h-24 rounded-full border border-cyan"
              animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut', delay: i * 0.9 }}
            />
          ))}

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 w-24 h-24 rounded-full bg-panel border border-cyan-dim flex items-center justify-center shadow-lg"
          >
            <MapPin size={40} className="text-cyan" strokeWidth={1.5} />
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            className="absolute top-2 left-2 flex items-center gap-1.5 bg-panel border border-cyan-dim rounded-full px-3 py-1.5 shadow-md"
          >
            <Users size={14} className="text-cyan" />
            <span className="font-body text-xs text-text-primary">Join Citizens</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            className="absolute bottom-10 right-0 flex items-center gap-1.5 bg-panel border border-cyan-dim rounded-full px-3 py-1.5 shadow-md"
          >
            <Bell size={14} className="text-cyan" />
            <span className="font-body text-xs text-text-primary">Stay Notified</span>
          </motion.div>
        </div>

        <div className="relative z-10">
          <p className="font-body text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="bg-light flex items-center justify-center px-6 py-14 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-cyan opacity-[0.08] blur-3xl pointer-events-none"></div>

        <form
          onSubmit={handleSubmit}
          className="relative z-10 bg-white border border-hairline shadow-xl rounded-3xl w-full max-w-md overflow-hidden"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan via-cyan-deep to-navy"></div>

          <div className="p-8">
            <div className="w-11 h-11 rounded-xl bg-navy flex items-center justify-center">
              <UserPlus size={20} className="text-cyan" />
            </div>

            <h2 className="font-heading text-2xl font-bold text-ink mt-4">
              Create your account
            </h2>
            <p className="font-body text-sm text-ink/60 mt-1">
              Start reporting issues in your city today.
            </p>

            {error && (
              <div className="bg-status-open-bg border border-status-open/30 text-status-open text-sm rounded-lg px-4 py-3 mt-5">
                {error}
              </div>
            )}

            <div className="mt-6">
              <Input
                id="name"
                name="name"
                type="text"
                label="Name"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mt-5">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mt-5">
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={UserPlus}
                loading={loading}
                className="w-full"
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </div>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-hairline"></div>
              <span className="font-body text-xs text-ink/40">OR</span>
              <div className="flex-1 h-px bg-hairline"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-2.5 border border-hairline rounded-full py-3 font-body text-sm font-semibold text-ink hover:border-cyan hover:bg-cyan-dim/20 transition-colors"
            >
              <GoogleIcon /> Sign up with Google
            </button>

            <p className="font-body text-sm text-ink/60 text-center mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;