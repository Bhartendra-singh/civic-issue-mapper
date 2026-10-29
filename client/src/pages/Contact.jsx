import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, Clock, User, FileText } from 'lucide-react';
import { sendContactMessage } from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' };

function Contact() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await sendContactMessage(formData);
      setSuccess(data.message);
      setFormData(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
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
            Get in <span className="text-cyan">touch.</span>
          </h1>
          <p className="font-body text-text-muted mt-4 max-w-sm">
            Questions, feedback or ideas to improve CivicMap? Send us a message and we'll get back to you.
          </p>
        </div>

        <div className="relative z-10 flex-1 min-h-[220px] flex items-center justify-center">
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
            <Mail size={36} className="text-cyan" strokeWidth={1.5} />
          </motion.div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-panel border border-cyan-dim flex items-center justify-center shrink-0">
              <Mail size={16} className="text-cyan" />
            </div>
            <div>
              <p className="font-body text-xs text-text-muted">Email</p>
              <a
                href="mailto:bhartendradeveloper059@gmail.com"
                className="font-body text-sm text-text-primary hover:text-cyan transition-colors"
              >
                bhartendradeveloper059@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-panel border border-cyan-dim flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-cyan" />
            </div>
            <div>
              <p className="font-body text-xs text-text-muted">Location</p>
              <p className="font-body text-sm text-text-primary">
                Graphic Era Deemed to be University, Dehradun
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-panel border border-cyan-dim flex items-center justify-center shrink-0">
              <Clock size={16} className="text-cyan" />
            </div>
            <div>
              <p className="font-body text-xs text-text-muted">Response time</p>
              <p className="font-body text-sm text-text-primary">Usually within 1-2 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="bg-light flex items-center justify-center px-6 py-14 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-cyan opacity-[0.08] blur-3xl pointer-events-none"></div>

        <form
          onSubmit={handleSubmit}
          className="relative z-10 bg-white border border-hairline shadow-xl rounded-3xl w-full max-w-lg overflow-hidden"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan via-cyan-deep to-navy"></div>

          <div className="p-8">
            <div className="w-11 h-11 rounded-xl bg-navy flex items-center justify-center">
              <Send size={20} className="text-cyan" />
            </div>

            <h2 className="font-heading text-2xl font-bold text-ink mt-4">
              Contact Us
            </h2>
            <p className="font-body text-sm text-ink/60 mt-1">
              Fill in the form and we'll reply to your email.
            </p>

            <div className="bg-cyan-dim/40 border border-cyan/30 text-ink text-sm rounded-lg px-4 py-3 mt-5">
                Want to report a civic issue like a pothole or garbage? Use{' '}
                <Link to="/submit-report" className="text-cyan font-semibold hover:underline">
                    Report Issue
                </Link>{' '}
                instead, so it reaches the right department.
            </div>

            {error && (
              <div className="bg-status-open-bg border border-status-open/30 text-status-open text-sm rounded-lg px-4 py-3 mt-5">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-cyan-dim border border-cyan/30 text-ink text-sm rounded-lg px-4 py-3 mt-5">
                {success}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5 mt-6">
              <Input
                id="name"
                name="name"
                type="text"
                label="Name"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
                required
              />
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
                id="subject"
                name="subject"
                type="text"
                label="Subject"
                icon={FileText}
                value={formData.subject}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>

            <div className="mt-5">
              <label htmlFor="message" className="font-body text-sm font-semibold text-ink">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                minLength={10}
                maxLength={2000}
                required
                className="mt-2 w-full border border-hairline rounded-xl px-4 py-3 font-body text-sm text-ink bg-white resize-none focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition"
              />
              <p className="font-body text-xs text-ink/40 text-right mt-1">
                {formData.message.length}/2000
              </p>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Send}
                loading={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Contact;