import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation(); // new change 

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <p className="font-body text-ink">Loading...</p>
      </div>
    );
  }


    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}


export default ProtectedRoute;