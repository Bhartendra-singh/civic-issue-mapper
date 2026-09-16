import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    
  return (
    <nav className="sticky top-0 z-50 bg-navy border-b border-cyan-dim px-6 py-4 flex items-center justify-between">

      <Link to="/" className="font-heading text-xl font-bold text-text-primary">
         Civic <span className="text-cyan">Map</span>
      </Link>

      <div className="flex items-center gap-6">

        <Link to="/map" className="font-body text-text-muted hover:text-cyan transition-colors">
          Map
        </Link>

        {user ? (
          <>

            <Link to="/my-reports" className="font-body text-text-muted hover:text-cyan transition-colors">
              My Reports
            </Link>

            <Link to="/submit-report" className="font-body text-text-muted hover:text-cyan transition-colors">
              Report Issue
            </Link>

            {user.role === 'admin' && (
              <Link to="/admin/dashboard" className="font-body text-text-muted hover:text-cyan transition-colors">
                Dashboard
              </Link>
            )}
            <span className="font-body text-text-primary">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="font-body text-text-primary border border-hairline px-4 py-2 rounded-lg hover:border-cyan hover:text-cyan transition-colors"
            >
              Logout
            </button>
          </>
        ) : (

            <>
                <Link to="/signup" className="font-body text-text-primary border border-hairline px-4 py-2 rounded-lg hover:border-cyan hover:text-cyan transition-colors">
                Sign Up
                </Link>

                <Link to="/login" className="font-body bg-cyan text-navy font-semibold px-4 py-2 rounded-lg hover:bg-cyan/90 transition-colors">
                Login
                </Link>
            </>

        )}
      </div>
    </nav>
  );
}


export default Navbar;