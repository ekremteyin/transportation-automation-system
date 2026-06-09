import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const senderLinks = [
  { to: '/sender', label: 'Dashboard', icon: '▦' },
  { to: '/sender/adverts', label: 'İlanlarım', icon: '📋' },
  { to: '/sender/adverts/new', label: 'Yeni İlan', icon: '＋' },
];

const carrierLinks = [
  { to: '/carrier', label: 'Dashboard', icon: '▦' },
  { to: '/carrier/open-adverts', label: 'Açık İlanlar', icon: '🔍' },
  { to: '/carrier/my-offers', label: 'Tekliflerim', icon: '💼' },
  { to: '/carrier/active-jobs', label: 'Aktif İşlerim', icon: '🚛' },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '▦' },
  { to: '/admin/users', label: 'Kullanıcılar', icon: '👥' },
  { to: '/admin/adverts', label: 'İlanlar', icon: '📋' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links =
    user?.role === 'Sender' ? senderLinks :
    user?.role === 'Carrier' ? carrierLinks :
    adminLinks;

  const roleLabel =
    user?.role === 'Sender' ? 'Gönderici' :
    user?.role === 'Carrier' ? 'Taşıyıcı' : 'Admin';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚛</span>
          <span className="text-white font-bold text-lg tracking-tight">Nakliye</span>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
            {user?.fullName?.[0] ?? '?'}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{user?.fullName}</p>
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">{roleLabel}</span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to.split('/').length === 2}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <span>⎋</span> Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
