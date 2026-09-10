import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCog, FaHome, FaCalendarAlt } from 'react-icons/fa';
// a4g
const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAdminClick = (e) => {
    e.preventDefault();
    // Navigate to admin with dashboard tab selected
    navigate('/admin', { state: { activeTab: 'dashboard' } });
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              A4G
            </div>
            <div>
              <span className="text-2xl font-heading font-bold text-primary group-hover:text-secondary transition-colors">
                Alliance4Growth
              </span>
              <span className="block text-xs text-neutral">Forth Valley</span>
            </div>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className="text-neutral hover:text-primary transition-colors flex items-center gap-1">
              <FaHome className="text-sm" /> Home
            </Link>
            <Link to="/events" className="text-neutral hover:text-primary transition-colors flex items-center gap-1">
              <FaCalendarAlt className="text-sm" /> Events
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <button
                    onClick={handleAdminClick}
                    className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <FaCog /> Admin
                  </button>
                )}
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.first_name?.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-neutral hidden md:inline">
                    {user?.first_name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-full"
                  title="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="text-neutral hover:text-primary transition-colors flex items-center gap-1"
                >
                  <FaSignInAlt /> Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary to-secondary text-white px-5 py-2 rounded-lg hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <FaUserPlus /> Join
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
