import { useEffect, useState, useRef } from "react";
import { useParams, Link } from 'react-router-dom';
import { verifyEmail } from "../services/api";
import { useAuth } from '../context/AuthContext';


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
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="bg-white border border-hairline rounded-lg p-8 max-w-md text-center">
        <h2 className="font-heading text-2xl font-bold text-ink mb-4">
          {status === 'verifying' && 'Verifying...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h2>

        {status === 'success' && (
          <p className="font-body text-ink mb-4">
            Your email has been verified. If you had this app open in another tab, please refresh it to see the update.
          </p>
        )}

        {status === 'error' && (
          <p className="font-body text-ink mb-4">{message}</p>
        )}

        <Link to="/" className="text-rust font-body underline">
          Go to Home
        </Link>
      </div>
    </div>
  );

    // return (
    //   <div className="min-h-screen bg-paper flex items-center justify-center px-4">
    //     <div className="bg-white border border-hairline rounded-lg p-8 max-w-md text-center">
    //         <h2 className="font-heading text-2xl font-bold text-ink mb-4">
    //         {status === 'verifying' && 'Verifying...'}
    //         {status === 'success' && 'Email Verified!'}
    //         {status === 'error' && 'Verification Failed'}
    //         </h2>
    //         <p className="font-body text-ink mb-4">{message}</p>
    //         <Link to="/login" className="text-rust font-body underline">
    //         Go to Login
    //         </Link>
    //     </div>
    //   </div>
    // );
}


export default VerifyEmail;