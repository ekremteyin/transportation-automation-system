import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyAdverts, deleteAdvert } from '../../api/advertApi';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';

export default function AdvertList() {
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getMyAdverts()
      .then(r => setAdverts(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) return;
    await deleteAdvert(id);
    load();
  };

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader
        title="İlanlarım"
        subtitle="Oluşturduğunuz tüm taşıma ilanları"
        action={
          <Link to="/sender/adverts/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            + Yeni İlan
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Yükleniyor...</div>
        ) : adverts.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="text-4xl mb-2">📦</p>
            <p>Henüz ilan oluşturmadınız.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Güzergah</th>
                <th className="px-5 py-3 text-left">Yük Türü</th>
                <th className="px-5 py-3 text-left">Tarih</th>
                <th className="px-5 py-3 text-left">Teklif</th>
                <th className="px-5 py-3 text-left">Durum</th>
                <th className="px-5 py-3 text-left">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adverts.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    <Link to={`/sender/adverts/${a.id}`} className="hover:text-blue-600">
                      {a.originCity} → {a.destCity}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{a.cargoType}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(a.transportDate).toLocaleDateString('tr-TR')}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">{a.offerCount}</span>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/sender/adverts/${a.id}`}
                        className="text-xs text-blue-600 hover:underline">Detay</Link>
                      {a.status === 'Open' && (
                        <>
                          <Link to={`/sender/adverts/${a.id}/edit`}
                            className="text-xs text-slate-500 hover:underline">Düzenle</Link>
                          <button onClick={() => handleDelete(a.id)}
                            className="text-xs text-red-500 hover:underline">Sil</button>
                        </>
                      )}
                    </div>
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
