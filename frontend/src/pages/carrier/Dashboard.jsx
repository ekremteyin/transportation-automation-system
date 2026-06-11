import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOpenAdverts } from '../../api/advertApi';
import { getMyOffers } from '../../api/offerApi';
import { getUserReviews } from '../../api/reviewApi';

/* ── Stat kartı ─────────────────────────────────────────────── */
function DashCard({ label, icon, iconBg, iconColor, children }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
      padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
      }}>
        {icon}
      </div>
      <div>
        {children}
        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, marginTop: 2 }}>{label}</p>
      </div>
    </div>
  );
}

function StatVal({ v }) {
  return <p style={{ fontSize: 20, fontWeight: 500, color: '#111827', margin: 0 }}>{v}</p>;
}

function StarVal({ rating }) {
  if (rating === null) return <StatVal v="—" />;
  const full = Math.round(rating);
  return (
    <div>
      <p style={{ fontSize: 20, fontWeight: 500, color: '#111827', margin: 0 }}>{rating.toFixed(1)}</p>
      <p style={{ fontSize: 12, color: '#f59e0b', margin: 0, lineHeight: 1 }}>
        {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      </p>
    </div>
  );
}

/* ── Teklif durum badge ─────────────────────────────────────── */
const BADGE = {
  Accepted: { label: 'Kabul',      bg: '#f0fdf4', color: '#15803d' },
  Pending:  { label: 'Bekliyor',   bg: '#fffbeb', color: '#b45309' },
  Rejected: { label: 'Reddedildi', bg: '#f3f4f6', color: '#6b7280' },
};

function OfferBadge({ status }) {
  const s = BADGE[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{
      fontSize: 12, fontWeight: 500, padding: '3px 10px',
      borderRadius: 999, background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

/* ── Ana bileşen ────────────────────────────────────────────── */
export default function CarrierDashboard() {
  const { user } = useAuth();
  const [openCount,  setOpenCount]  = useState(0);
  const [offers,     setOffers]     = useState([]);
  const [rating,     setRating]     = useState(null);

  useEffect(() => {
    getOpenAdverts({})
      .then(r => setOpenCount(r.data.length))
      .catch(() => {});

    getMyOffers()
      .then(r => setOffers(r.data))
      .catch(() => {});

    if (user?.userId) {
      getUserReviews(user.userId)
        .then(r => {
          const list = r.data ?? [];
          if (!list.length) return;
          setRating(list.reduce((s, rv) => s + rv.rating, 0) / list.length);
        })
        .catch(() => {});
    }
  }, [user?.userId]);

  const pendingCount = offers.filter(o => o.status === 'Pending').length;
  const activeCount  = offers.filter(o => o.status === 'Accepted' && o.advertStatus === 'InProgress').length;
  const recent       = offers.slice(0, 3);

  return (
    <div style={{ padding: '20px 24px', maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── 4 Stat kart ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <DashCard label="Açık ilan"       icon="📄" iconBg="#eff6ff" iconColor="#2563eb">
          <StatVal v={openCount} />
        </DashCard>
        <DashCard label="Bekleyen teklif" icon="⏳" iconBg="#fffbeb" iconColor="#d97706">
          <StatVal v={pendingCount} />
        </DashCard>
        <DashCard label="Aktif iş"        icon="🚛" iconBg="#f0fdf4" iconColor="#16a34a">
          <StatVal v={activeCount} />
        </DashCard>
        <DashCard label="Ortalama puan"   icon="⭐" iconBg="#faf5ff" iconColor="#7c3aed">
          <StarVal rating={rating} />
        </DashCard>
      </div>

      {/* ── Son Tekliflerim ──────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid #f3f4f6',
        }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>Son tekliflerim</span>
          <Link to="/carrier/my-offers" style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none' }}>
            Tümü →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
            Henüz teklif vermediniz.
          </div>
        ) : (
          <div>
            {recent.map((o, i) => (
              <div key={o.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 20px',
                borderBottom: i < recent.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
                    {o.advertRoute}
                  </p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, marginTop: 2 }}>
                    ₺{o.price.toLocaleString('tr-TR')}
                    {o.estimatedDate && ` · ${new Date(o.estimatedDate).toLocaleDateString('tr-TR')}`}
                  </p>
                </div>
                <OfferBadge status={o.status} />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
