import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import { verifyEmail } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const hasRun = useRef(false);
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const runVerification = async () => {
      try {
        const data = await verifyEmail(token);
        setMessage(data.message);
        setStatus('success');
        refreshUser();
      } catch (err) {
        setMessage(err.message);
        setStatus('error');
      }
    };
    runVerification();
  }, [token]);

  return (
    <div className="min-h-screen bg-light flex items-center justify-center px-4">
      <div className="bg-white border border-hairline shadow-xl rounded-3xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan via-cyan-deep to-navy"></div>

        <div className="p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-cyan-dim flex items-center justify-center mx-auto">
            {status === 'verifying' && <Loader2 size={26} className="text-cyan animate-spin" />}
            {status === 'success' && <CheckCircle2 size={26} className="text-status-resolved" />}
            {status === 'error' && <XCircle size={26} className="text-status-open" />}
          </div>

          <h2 className="font-heading text-2xl font-bold text-ink mt-5">
            {status === 'verifying' && 'Verifying...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h2>

          {status === 'success' && (
            <p className="font-body text-sm text-ink/60 mt-2">
              Your email has been verified. If you had this app open in another tab, please refresh it to see the update.
            </p>
          )}

          {status === 'error' && (
            <p className="font-body text-sm text-ink/60 mt-2">{message}</p>
          )}

          {status !== 'verifying' && (
            <div className="mt-6">
              <Link to="/">
                <Button variant="primary" size="md" icon={MapPin} className="w-full">
                  Go to Home
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;