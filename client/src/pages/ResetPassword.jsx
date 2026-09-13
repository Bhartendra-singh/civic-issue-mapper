import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white border border-hairline rounded-lg p-8 w-full max-w-md">
        <h2 className="font-heading text-2xl font-bold text-ink mb-6">Reset Password</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block font-body text-sm text-ink mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-hairline rounded px-3 py-2 font-body focus:outline-none focus:border-rust"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rust text-white font-body font-semibold py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;