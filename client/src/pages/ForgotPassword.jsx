import { useState } from 'react';
import { forgotPassword } from '../services/api';

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
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white border border-hairline rounded-lg p-8 w-full max-w-md">
        <h2 className="font-heading text-2xl font-bold text-ink mb-6">Forgot Password</h2>

        {message && (
          <div className="bg-amber/10 border border-amber text-ink text-sm rounded px-3 py-2 mb-4">
            {message}
          </div>
        )}

        <div className="mb-6">
          <label className="block font-body text-sm text-ink mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-hairline rounded px-3 py-2 font-body focus:outline-none focus:border-rust"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rust text-white font-body font-semibold py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}


export default ForgotPassword;