import { useEffect, useState } from 'react';
import { getAdminAdverts, deleteAdminAdvert } from '../../api/adminApi';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';

export default function AdvertManagement() {
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    getAdminAdverts().then(r => setAdverts(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) return;
    setDeleting(id);
    try { await deleteAdminAdvert(id); load(); }
    finally { setDeleting(null); }
  };

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader title="İlan Yönetimi" subtitle={`${adverts.length} ilan`} />

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Yükleniyor...</div>
        ) : adverts.length === 0 ? (
          <div className="p-10 text-center text-slate-400">İlan bulunamadı.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Güzergah</th>
                <th className="px-5 py-3 text-left">Gönderici</th>
                <th className="px-5 py-3 text-left">Yük</th>
                <th className="px-5 py-3 text-left">Tarih</th>
                <th className="px-5 py-3 text-left">Teklif</th>
                <th className="px-5 py-3 text-left">Durum</th>
                <th className="px-5 py-3 text-left">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adverts.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-medium text-slate-800">{a.originCity} → {a.destCity}</td>
                  <td className="px-5 py-3 text-slate-500">{a.senderName}</td>
                  <td className="px-5 py-3 text-slate-500">{a.cargoType}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(a.transportDate).toLocaleDateString('tr-TR')}</td>
                  <td className="px-5 py-3 text-slate-600">{a.offerCount}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={deleting === a.id}
                      className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-60">
                      {deleting === a.id ? '...' : 'Sil'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
