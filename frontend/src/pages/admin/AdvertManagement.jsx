import { useEffect, useState } from 'react';
import { getAdminAdverts } from '../../api/adminApi';

const statusBadge = {
  Open:       { label: 'Açık',       bg: '#f0fdf4', color: '#15803d' },
  Matched:    { label: 'Eşleşti',    bg: '#eff6ff', color: '#1d4ed8' },
  InProgress: { label: 'Taşınıyor',  bg: '#fffbeb', color: '#b45309' },
  Completed:  { label: 'Tamamlandı', bg: '#f3f4f6', color: '#6b7280' },
  Cancelled:  { label: 'İptal',      bg: '#fef2f2', color: '#b91c1c' },
};

function StatusBadge({ status }) {
  const s = statusBadge[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{
      backgroundColor: s.bg,
      color: s.color,
      fontSize: 12,
      fontWeight: 500,
      padding: '3px 10px',
      borderRadius: 999,
      display: 'inline-block',
    }}>
      {s.label}
    </span>
  );
}

export default function AdvertManagement() {
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAdminAdverts().then(r => setAdverts(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-5 max-w-5xl">
      {/* Sayfa başlığı */}
      <div className="mb-5">
        <h1 style={{ fontSize: 22, fontWeight: 500 }} className="text-slate-800">İlan Yönetimi</h1>
        <p style={{ fontSize: 14 }} className="text-slate-400 mt-0.5">{adverts.length} ilan</p>
      </div>

      {/* Tablo kartı */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        {loading ? (
          <div className="p-10 text-center text-slate-400">Yükleniyor...</div>
        ) : adverts.length === 0 ? (
          <div className="p-10 text-center text-slate-400">İlan bulunamadı.</div>
        ) : (
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Güzergah', 'Gönderici', 'Yük', 'Tarih', 'Teklif', 'Durum'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adverts.map((a, i) => (
                <tr key={a.id}
                  style={{ borderBottom: i < adverts.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                >
                  <td style={{ padding: '12px 16px', fontSize: 15, fontWeight: 500, color: '#1f2937' }}>
                    {a.originCity} → {a.destCity}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b7280' }}>{a.senderName}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b7280' }}>{a.cargoType}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b7280' }}>
                    {new Date(a.transportDate).toLocaleDateString('tr-TR')}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#374151' }}>{a.offerCount}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
