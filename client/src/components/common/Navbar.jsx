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
    <nav className="bg-paper border-b border-hairline px-6 py-4 flex items-center justify-between">

      <Link to="/" className="font-heading text-xl font-bold text-ink">
        Civic Issue Mapper
      </Link>

      <div className="flex items-center gap-6">

        <Link to="/map" className="font-body text-ink hover:text-rust transition-colors">
          Map
        </Link>

        {user ? (
          <>
            {user.role === 'admin' && (
              <Link to="/admin/dashboard" className="font-body text-ink hover:text-rust transition-colors">
                Dashboard
              </Link>
            )}
            <span className="font-body text-ink">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="font-body text-ink hover:text-rust transition-colors"
            >
              Logout
            </button>
          </>
        ) : (

            <>
                <Link to="/signup" className="font-body text-ink hover:text-rust transition-colors">
                Sign Up
                </Link>

                <Link to="/login" className="font-body text-ink hover:text-rust transition-colors">
                Login
                </Link>
            </>

        )}
      </div>
    </nav>
  );
}


export default Navbar;