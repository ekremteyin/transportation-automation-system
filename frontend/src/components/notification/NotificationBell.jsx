import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyNotifications, markAllRead } from '../../api/notificationApi';

const TYPE_ICON = {
  NewOffer:      '💬',
  OfferAccepted: '✅',
  OfferRejected: '❌',
  StatusUpdated: '🚛',
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return 'az önce';
  if (diff < 3600)  return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unread = notifications.filter(n => !n.isRead).length;

  const fetch = () => {
    if (!user) return;
    getMyNotifications().then(r => setNotifications(r.data)).catch(() => {});
  };

  // İlk yüklemede ve 30 sn'de bir polling
  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 30_000);
    return () => clearInterval(id);
  }, [user]);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleItemClick = (n) => {
    setOpen(false);
    if (!n.advertId) return;
    if (user?.role === 'Sender')  navigate(`/sender/adverts/${n.advertId}`);
    if (user?.role === 'Carrier') navigate('/carrier/active-jobs');
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(p => !p)}
        className="relative p-2 rounded-lg hover:bg-blue-600 transition"
        title="Bildirimler"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#ef4444', color: 'white',
            borderRadius: '50%', minWidth: 18, height: 18,
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="font-semibold text-slate-700 text-sm">
              Bildirimler
              {unread > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unread} yeni
                </span>
              )}
            </span>
            {unread > 0 && (
              <button onClick={handleMarkAll}
                className="text-xs text-blue-600 hover:underline">
                Tümünü okundu işaretle
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">Bildirim yok.</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition
                    ${!n.isRead ? 'bg-blue-50/60' : ''}`}
                >
                  <span className="text-lg shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.isRead ? 'font-medium text-slate-800' : 'text-slate-600'}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
