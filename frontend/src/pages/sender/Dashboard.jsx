import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyAdverts } from '../../api/advertApi';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';

export default function SenderDashboard() {
  const { user } = useAuth();
  const [adverts, setAdverts] = useState([]);

  useEffect(() => {
    getMyAdverts().then(r => setAdverts(r.data)).catch(() => {});
  }, []);

  const stats = {
    total: adverts.length,
    open: adverts.filter(a => a.status === 'Open').length,
    inProgress: adverts.filter(a => a.status === 'InProgress').length,
    completed: adverts.filter(a => a.status === 'Completed').length,
  };

  const recent = adverts.slice(0, 5);

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader
        title={`Hoş geldin, ${user?.fullName} 👋`}
        subtitle="İlan ve taşıma süreçlerinizi buradan yönetin."
        action={
          <Link to="/sender/adverts/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            + Yeni İlan
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Toplam İlan"    value={stats.total}      icon="📋" color="blue" />
        <StatCard label="Açık İlanlar"   value={stats.open}       icon="🟢" color="green" />
        <StatCard label="Taşınıyor"      value={stats.inProgress} icon="🚛" color="amber" />
        <StatCard label="Tamamlandı"     value={stats.completed}  icon="✅" color="purple" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700">Son İlanlar</h2>
          <Link to="/sender/adverts" className="text-sm text-blue-600 hover:underline">Tümünü gör →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="text-4xl mb-2">📦</p>
            <p>Henüz ilan oluşturmadınız.</p>
            <Link to="/sender/adverts/new" className="text-blue-600 text-sm hover:underline mt-1 inline-block">İlk ilanınızı oluşturun</Link>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    <Link to={`/sender/adverts/${a.id}`} className="hover:text-blue-600">
                      {a.originCity} → {a.destCity}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{a.cargoType}</td>
                  <td className="px-5 py-3 text-slate-600">{new Date(a.transportDate).toLocaleDateString('tr-TR')}</td>
                  <td className="px-5 py-3 text-slate-600">{a.offerCount}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
