import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import { Children } from 'react';


function AdminRoute({ children }) {
    const { user, loading } = useAuth();


    console.log('AdminRoute check:', { user, loading });

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-body text-ink">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;

}


export default AdminRoute;