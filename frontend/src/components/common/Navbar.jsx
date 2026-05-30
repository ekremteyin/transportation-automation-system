import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = user?.role === 'Sender'
    ? '/sender'
    : user?.role === 'Carrier'
    ? '/carrier'
    : '/admin';

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between shadow">
      <Link to={dashboardPath} className="text-xl font-bold tracking-tight">
        Nakliye Sistemi
      </Link>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">
            {user.fullName} · {user.role}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-white text-blue-700 px-3 py-1 rounded hover:bg-blue-50 transition"
          >
            Çıkış
          </button>
        </div>
      )}
    </nav>
  );
}
