import { useEffect, useState } from 'react';
import { getAdminUsers, toggleUser } from '../../api/adminApi';

const roleLabel = { Sender: 'Gönderici', Carrier: 'Taşıyıcı' };
const roleColor  = {
  Sender:  'bg-teal-100 text-teal-700',
  Carrier: 'bg-amber-100 text-amber-700',
};

function Avatar({ name }) {
  return (
    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center shrink-0">
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

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
    <div className="p-5 max-w-5xl">
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center">
          <span className="text-xs text-slate-400">{users.length} kullanıcı</span>
        </div>
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
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.firstName} />
                      <span className="font-medium text-slate-800">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role]}`}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {u.vehicleType ? `${u.vehicleType} · ${u.city}` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    {u.ratingCount > 0 ? (
                      <span className="text-amber-500">★ {u.averageRating.toFixed(1)}</span>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {u.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggle(u.id)}
                      disabled={toggling === u.id}
                      className="text-xs px-3 py-1 rounded-lg font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition disabled:opacity-60">
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
