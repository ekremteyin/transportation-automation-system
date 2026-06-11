import { useEffect, useState } from 'react';
import { getMyOffers } from '../../api/offerApi';
import PageHeader from '../../components/common/PageHeader';

export default function CarrierHistory() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOffers()
      .then(r => {
        const history = r.data.filter(
          o => o.status === 'Accepted' &&
               (o.advertStatus === 'Completed' || o.advertStatus === 'Cancelled')
        );
        setJobs(history);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-3xl">
      <PageHeader
        title="Geçmiş İşlerim"
        subtitle="Tamamlanan ve iptal edilen taşımalarınız."
      />

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Yükleniyor...</div>
        ) : jobs.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="text-3xl mb-2">📋</p>
            <p>Henüz tamamlanan işiniz yok.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.map(job => (
              <div key={job.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-slate-800">{job.advertRoute}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-slate-500">
                    {job.cargoType && <span>{job.cargoType}</span>}
                    {job.transportDate && (
                      <span>{new Date(job.transportDate).toLocaleDateString('tr-TR')}</span>
                    )}
                    <span>₺{job.price.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
                {job.advertStatus === 'Completed' ? (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    ✅ Tamamlandı
                  </span>
                ) : (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                    ✕ İptal
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
