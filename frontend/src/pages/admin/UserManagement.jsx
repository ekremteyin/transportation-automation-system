import { useEffect, useState } from 'react';
import { getAdminUsers, toggleUser } from '../../api/adminApi';
import PageHeader from '../../components/common/PageHeader';

const roleLabel = { Sender: 'Gönderici', Carrier: 'Taşıyıcı' };
const roleColor = { Sender: 'bg-blue-100 text-blue-700', Carrier: 'bg-amber-100 text-amber-700' };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const load = () => {
    setLoading(true);
    getAdminUsers().then(r => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    setToggling(id);
    try { await toggleUser(id); load(); }
    finally { setToggling(null); }
  };

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader
        title="Kullanıcı Yönetimi"
        subtitle={`${users.length} kullanıcı`}
      />

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Yükleniyor...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Ad Soyad</th>
                <th className="px-5 py-3 text-left">E-posta</th>
                <th className="px-5 py-3 text-left">Rol</th>
                <th className="px-5 py-3 text-left">Araç / Şehir</th>
                <th className="px-5 py-3 text-left">Puan</th>
                <th className="px-5 py-3 text-left">Durum</th>
                <th className="px-5 py-3 text-left">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className={`hover:bg-slate-50 transition ${!u.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3 font-medium text-slate-800">{u.firstName} {u.lastName}</td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role]}`}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {u.vehicleType ? `${u.vehicleType} · ${u.city}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {u.ratingCount > 0 ? (
                      <span className="text-amber-500">★ {u.averageRating.toFixed(1)}</span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {u.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggle(u.id)}
                      disabled={toggling === u.id}
                      className={`text-xs px-3 py-1 rounded-lg font-medium border transition disabled:opacity-60 ${
                        u.isActive
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}>
                      {toggling === u.id ? '...' : u.isActive ? 'Pasif Yap' : 'Aktif Yap'}
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
