import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const senderLinks = [
  { to: '/sender',             label: 'Dashboard'      },
  { to: '/sender/adverts',     label: 'İlanlarım'      },
  { to: '/sender/adverts/new', label: 'Yeni İlan'      },
];

const carrierLinks = [
  { to: '/carrier',              label: 'Dashboard'      },
  { to: '/carrier/open-adverts', label: 'Açık İlanlar'  },
  { to: '/carrier/my-offers',    label: 'Tekliflerim'   },
  { to: '/carrier/active-jobs',  label: 'Aktif İşlerim' },
  { to: '/carrier/history',      label: 'Geçmiş İşlerim'},
];

const adminSections = [
  {
    heading: 'GENEL',
    links: [{ to: '/admin', label: 'Dashboard' }],
  },
  {
    heading: 'YÖNETİM',
    links: [
      { to: '/admin/users',   label: 'Kullanıcılar' },
      { to: '/admin/adverts', label: 'İlanlar'       },
    ],
  },
];

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to.split('/').length === 2}
      style={({ isActive }) => ({
        display: 'block',
        padding: '8px 12px',
        borderRadius: 6,
        borderLeft: `2px solid ${isActive ? '#6366f1' : 'transparent'}`,
        background: isActive ? 'rgba(99,102,241,0.09)' : 'transparent',
        color: isActive ? '#ffffff' : '#94a3b8',
        fontSize: 13,
        fontWeight: isActive ? 500 : 400,
        textDecoration: 'none',
        transition: 'color 0.15s, background 0.15s',
      })}
    >
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleLabel =
    user?.role === 'Sender'  ? 'Gönderici' :
    user?.role === 'Carrier' ? 'Taşıyıcı'  : 'Admin';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{ width: 220, background: '#0f172a' }} className="min-h-screen flex flex-col shrink-0">

      {/* Kullanıcı bilgisi */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0,
          }}>
            {user?.fullName?.[0] ?? '?'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName}
            </p>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0, marginTop: 2 }}>{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Navigasyon */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {user?.role === 'Admin' ? (
          adminSections.map(section => (
            <div key={section.heading} style={{ marginBottom: 12 }}>
              <p style={{
                fontSize: 10, fontWeight: 600, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                padding: '6px 12px 4px', margin: 0,
              }}>
                {section.heading}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {section.links.map(link => <NavItem key={link.to} {...link} />)}
              </div>
            </div>
          ))
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(user?.role === 'Sender' ? senderLinks : carrierLinks).map(link => (
              <NavItem key={link.to} {...link} />
            ))}
          </div>
        )}
      </nav>

      {/* Çıkış */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', textAlign: 'left',
            padding: '8px 12px', borderRadius: 6, border: 'none',
            background: 'transparent', color: '#64748b', fontSize: 13,
            cursor: 'pointer', transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
