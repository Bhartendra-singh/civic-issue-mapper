import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-hairline rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="font-heading text-2xl font-bold text-ink mb-6">
          Sign Up
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block font-body text-sm text-ink mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-hairline rounded px-3 py-2 font-body focus:outline-none focus:border-rust"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-body text-sm text-ink mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-hairline rounded px-3 py-2 font-body focus:outline-none focus:border-rust"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block font-body text-sm text-ink mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-hairline rounded px-3 py-2 font-body focus:outline-none focus:border-rust"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rust text-white font-body font-semibold py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default Signup;