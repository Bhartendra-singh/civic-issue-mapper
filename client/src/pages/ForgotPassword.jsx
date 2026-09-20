import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, MapPin, ShieldCheck } from 'lucide-react';
import { forgotPassword } from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setMessage(data.message);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
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
            Forgot your <span className="text-cyan">password?</span>
          </h1>
          <p className="font-body text-text-muted mt-4 max-w-sm">
            No worries. Enter your email and we'll send you a link to reset it.
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
            <KeyRound size={36} className="text-cyan" strokeWidth={1.5} />
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            className="absolute top-4 right-2 flex items-center gap-1.5 bg-panel border border-cyan-dim rounded-full px-3 py-1.5 shadow-md"
          >
            <ShieldCheck size={14} className="text-cyan" />
            <span className="font-body text-xs text-text-primary">Secure Reset</span>
          </motion.div>
        </div>

        <div className="relative z-10">
          <p className="font-body text-sm text-text-muted">
            Remember your password?{' '}
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
              <MapPin size={20} className="text-cyan" />
            </div>

            <h2 className="font-heading text-2xl font-bold text-ink mt-4">
              Forgot Password
            </h2>
            <p className="font-body text-sm text-ink/60 mt-1">
              Enter your email and we'll send you a reset link.
            </p>

            {message && (
              <div className="bg-cyan-dim border border-cyan/30 text-ink text-sm rounded-lg px-4 py-3 mt-5">
                {message}
              </div>
            )}

            <div className="mt-6">
              <Input
                id="email"
                type="email"
                label="Email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Mail}
                loading={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </div>

            <p className="font-body text-sm text-ink/60 text-center mt-6">
              Remembered your password?{' '}
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

export default ForgotPassword;