import { useAuth } from '../../context/AuthContext';

function VerificationBanner() {
  const { user } = useAuth();

  if (!user || user.isVerified) {
    return null;
  }

  return (
    <div className="bg-amber text-white text-center py-2 font-body text-sm">
      Please verify your email address to submit reports.
    </div>
  );
}

export default VerificationBanner;