import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-body text-ink">Loading...</p>
      </div>
    );
  }


    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
}


export default ProtectedRoute;