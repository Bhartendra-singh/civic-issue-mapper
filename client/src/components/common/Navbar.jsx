import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


function Navbar() {
    const { user, logout } = useAuth();

    
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
            <span className="font-body text-ink">Hi, {user.name}</span>
            <button
              onClick={logout}
              className="font-body text-ink hover:text-rust transition-colors"
            >
              Logout
            </button>
          </>
        ) : (

          <Link to="/login" className="font-body text-ink hover:text-rust transition-colors">
            Login
          </Link>
          
        )}
      </div>
    </nav>
  );
}


export default Navbar;