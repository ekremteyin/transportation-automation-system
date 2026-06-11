import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notification/NotificationBell';
import { getUnreadCount } from '../../api/messageApi';

const PAGE_TITLES = {
  '/admin':           'Admin Paneli',
  '/admin/users':     'Kullanıcı Yönetimi',
  '/admin/adverts':   'İlan Yönetimi',
  '/sender':          'Dashboard',
  '/sender/adverts':  'İlanlarım',
  '/sender/adverts/new': 'Yeni İlan',
  '/carrier':         'Dashboard',
  '/carrier/open-adverts': '',
  '/carrier/my-offers':    '',
  '/carrier/active-jobs':  '',
  '/carrier/history':      '',
  '/messages':        'Mesajlar',
};

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (/^\/sender\/adverts\/\d+\/edit$/.test(pathname)) return 'İlan Düzenle';
  if (/^\/sender\/adverts\/\d+$/.test(pathname)) return 'İlan Detayı';
  return '';
}

export default function Navbar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [msgUnread, setMsgUnread] = useState(0);

  useEffect(() => {
    if (!user || user.role === 'Admin') return;
    const fetch = () => getUnreadCount().then(r => setMsgUnread(r.data.count)).catch(() => {});
    fetch();
    const id = setInterval(fetch, 30_000);
    return () => clearInterval(id);
  }, [user]);

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
        {getPageTitle(pathname)}
      </span>

      {user && (
        <div className="flex items-center gap-2">
          {user.role !== 'Admin' && (
            <Link
              to="/messages"
              className="relative p-2 rounded-lg hover:bg-slate-100 transition"
              title="Mesajlar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {msgUnread > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />
              )}
            </Link>
          )}
          <NotificationBell />
          <span className="text-sm text-slate-600 font-medium pl-1">{user.fullName}</span>
        </div>
      )}
    </nav>
  );
}
