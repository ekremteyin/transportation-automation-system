import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notification/NotificationBell';
import { getUnreadCount } from '../../api/messageApi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [msgUnread, setMsgUnread] = useState(0);

  useEffect(() => {
    if (!user || user.role === 'Admin') return;
    const fetch = () => getUnreadCount().then(r => setMsgUnread(r.data.count)).catch(() => {});
    fetch();
    const id = setInterval(fetch, 30_000);
    return () => clearInterval(id);
  }, [user]);

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
        <div className="flex items-center gap-3">
          {user.role !== 'Admin' && (
            <Link to="/messages" className="relative p-2 rounded-lg hover:bg-blue-600 transition" title="Mesajlar">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {msgUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                  {msgUnread > 9 ? '9+' : msgUnread}
                </span>
              )}
            </Link>
          )}
          <NotificationBell />
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
