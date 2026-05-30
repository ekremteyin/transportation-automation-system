import { useEffect, useState } from 'react';
import { getMyOffers } from '../../api/offerApi';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';

export default function MyOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOffers().then(r => setOffers(r.data)).finally(() => setLoading(false));
  }, []);

  const grouped = {
    Pending: offers.filter(o => o.status === 'Pending'),
    Accepted: offers.filter(o => o.status === 'Accepted'),
    Rejected: offers.filter(o => o.status === 'Rejected'),
  };

  return (
    <div className="p-6 max-w-3xl">
      <PageHeader
        title="Tekliflerim"
        subtitle="Verdiğiniz tüm tekliflerin durumunu takip edin."
      />

      {/* Özet */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Bekleyen', count: grouped.Pending.length, color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Kabul Edilen', count: grouped.Accepted.length, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          { label: 'Reddedilen', count: grouped.Rejected.length, color: 'bg-red-50 border-red-200 text-red-600' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Yükleniyor...</div>
        ) : offers.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="text-3xl mb-2">📭</p>
            <p>Henüz teklif vermediniz.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {offers.map(o => (
              <div key={o.id} className={`px-5 py-4 ${o.status === 'Rejected' ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 mb-0.5">{o.advertRoute}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      {o.estimatedDate && (
                        <span>📅 {new Date(o.estimatedDate).toLocaleDateString('tr-TR')}</span>
                      )}
                      <span>🕐 {new Date(o.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    {o.note && (
                      <p className="text-sm text-slate-400 mt-1">"{o.note}"</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-slate-800 mb-1">₺{o.price.toLocaleString('tr-TR')}</p>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
