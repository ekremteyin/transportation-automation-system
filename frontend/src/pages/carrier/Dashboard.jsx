import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOpenAdverts } from '../../api/advertApi';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';

export default function CarrierDashboard() {
  const { user } = useAuth();
  const [openAdverts, setOpenAdverts] = useState([]);

  useEffect(() => {
    getOpenAdverts({}).then(r => setOpenAdverts(r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader
        title={`Hoş geldin, ${user?.fullName} 👋`}
        subtitle="Açık ilanları incele ve teklif ver."
        action={
          <Link to="/carrier/open-adverts"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Açık İlanlar →
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Açık İlan Sayısı"   value={openAdverts.length} icon="📋" color="blue" />
        <StatCard label="Bekleyen Teklifler"  value={0}                  icon="⏳" color="amber" />
        <StatCard label="Tamamlanan İş"       value={0}                  icon="✅" color="green" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700">Son Açık İlanlar</h2>
          <Link to="/carrier/open-adverts" className="text-sm text-blue-600 hover:underline">Tümünü gör →</Link>
        </div>
        {openAdverts.length === 0 ? (
          <div className="p-10 text-center text-slate-400">Şu an açık ilan bulunmuyor.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Güzergah</th>
                <th className="px-5 py-3 text-left">Yük</th>
                <th className="px-5 py-3 text-left">Tarih</th>
                <th className="px-5 py-3 text-left">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {openAdverts.slice(0,5).map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-medium text-slate-800">{a.originCity} → {a.destCity}</td>
                  <td className="px-5 py-3 text-slate-600">{a.cargoType}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(a.transportDate).toLocaleDateString('tr-TR')}</td>
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
