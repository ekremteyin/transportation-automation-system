import { useEffect, useState } from 'react';
import { getMyOffers } from '../../api/offerApi';
import { updateAdvertStatus } from '../../api/offerApi';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';

const nextStatus = { Matched: 'InProgress', InProgress: 'Completed' };
const nextLabel = { Matched: 'Taşımayı Başlat', InProgress: 'Teslim Edildi' };
const nextColor = {
  Matched: 'bg-blue-600 hover:bg-blue-700',
  InProgress: 'bg-emerald-600 hover:bg-emerald-700',
};

export default function ActiveJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const load = () => {
    setLoading(true);
    getMyOffers()
      .then(r => setJobs(r.data.filter(o => {
        const advStatus = o.advertStatus ?? 'Matched';
        return o.status === 'Accepted' && (advStatus === 'Matched' || advStatus === 'InProgress');
      })))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusUpdate = async (advertId, currentStatus) => {
    const next = nextStatus[currentStatus];
    if (!next) return;
    if (!confirm(`"${nextLabel[currentStatus]}" olarak işaretlemek istediğinize emin misiniz?`)) return;
    setActionId(advertId);
    try {
      await updateAdvertStatus(advertId, next);
      load();
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <PageHeader
        title="Aktif İşlerim"
        subtitle="Kabul edilen teklifleriniz ve taşıma durumları."
      />

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Yükleniyor...</div>
        ) : jobs.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="text-3xl mb-2">🚛</p>
            <p>Aktif işiniz bulunmuyor.</p>
            <p className="text-xs mt-1">Teklifleriniz kabul edildiğinde burada görünecek.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.map(job => {
              const advertStatus = job.advertStatus ?? 'Matched';
              return (
                <div key={job.id} className="px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-base">{job.advertRoute}</span>
                        <StatusBadge status={advertStatus} />
                      </div>

                      {/* Durum adımları */}
                      <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                        {['Matched', 'InProgress', 'Completed'].map((s, i) => {
                          const steps = ['Matched', 'InProgress', 'Completed'];
                          const currentIdx = steps.indexOf(advertStatus);
                          const stepIdx = i;
                          const done = stepIdx <= currentIdx;
                          const labels = { Matched: 'Eşleşti', InProgress: 'Taşınıyor', Completed: 'Tamamlandı' };
                          return (
                            <div key={s} className="flex items-center gap-1">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                                ${done ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {stepIdx + 1}
                              </span>
                              <span className={done ? 'text-slate-600' : 'text-slate-300'}>{labels[s]}</span>
                              {i < 2 && <span className={`mx-1 ${done && stepIdx < currentIdx ? 'text-blue-400' : 'text-slate-200'}`}>→</span>}
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-sm text-slate-500 space-y-0.5">
                        <p>Teklif: <span className="font-semibold text-slate-700">₺{job.price.toLocaleString('tr-TR')}</span></p>
                        {job.estimatedDate && (
                          <p>📅 Tahmini teslim: {new Date(job.estimatedDate).toLocaleDateString('tr-TR')}</p>
                        )}
                      </div>
                    </div>

                    {nextStatus[advertStatus] && (
                      <button
                        onClick={() => handleStatusUpdate(job.advertId, advertStatus)}
                        disabled={actionId === job.advertId}
                        className={`shrink-0 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 transition ${nextColor[advertStatus]}`}>
                        {actionId === job.advertId ? '...' : nextLabel[advertStatus]}
                      </button>
                    )}
                    {advertStatus === 'Completed' && (
                      <span className="shrink-0 text-emerald-600 text-sm font-medium">✅ Tamamlandı</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
