import { useEffect, useState } from 'react';
import { getComplaints, resolveComplaint } from '../../api/adminApi';
import PageHeader from '../../components/common/PageHeader';

const statusColor = {
  Pending:   'bg-amber-100 text-amber-700',
  Resolved:  'bg-emerald-100 text-emerald-700',
  Dismissed: 'bg-slate-100 text-slate-500',
};
const statusLabel = { Pending: 'Bekliyor', Resolved: 'Çözüldü', Dismissed: 'Reddedildi' };

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const load = () => {
    setLoading(true);
    getComplaints().then(r => setComplaints(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handle = async (id, status) => {
    setActing(id);
    try { await resolveComplaint(id, status); load(); }
    finally { setActing(null); }
  };

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader title="Şikayetler" subtitle={`${complaints.filter(c => c.status === 'Pending').length} bekleyen şikayet`} />

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Yükleniyor...</div>
        ) : complaints.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="text-3xl mb-2">✅</p>
            <p>Bekleyen şikayet yok.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map(c => (
              <div key={c.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-slate-800">{c.reporterName}</span>
                      <span className="text-slate-400 text-xs">→</span>
                      <span className="text-sm text-slate-600">{c.targetName ?? 'Genel'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[c.status]}`}>
                        {statusLabel[c.status]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{c.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(c.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  {c.status === 'Pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handle(c.id, 'Resolved')} disabled={acting === c.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition">
                        Çözüldü
                      </button>
                      <button onClick={() => handle(c.id, 'Dismissed')} disabled={acting === c.id}
                        className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60 transition">
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
