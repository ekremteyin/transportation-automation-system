import { useEffect, useState } from 'react';
import { getAdminStats } from '../../api/adminApi';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader title="Admin Paneli" subtitle="Sistemin genel durumu." />

      {stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Toplam Kullanıcı"  value={stats.totalUsers}       icon="👥" color="blue" />
          <StatCard label="Gönderici"          value={stats.totalSenders}     icon="📦" color="purple" />
          <StatCard label="Taşıyıcı"           value={stats.totalCarriers}    icon="🚛" color="amber" />
          <StatCard label="Toplam İlan"        value={stats.totalAdverts}     icon="📋" color="blue" />
          <StatCard label="Açık İlan"          value={stats.openAdverts}      icon="🟢" color="green" />
          <StatCard label="Tamamlanan"         value={stats.completedAdverts} icon="✅" color="green" />
          <StatCard label="Toplam Teklif"      value={stats.totalOffers}      icon="💬" color="purple" />
          <StatCard label="Bekleyen Şikayet"   value={stats.pendingComplaints} icon="⚠️" color="amber" />
        </div>
      ) : (
        <div className="text-slate-400 text-sm">Yükleniyor...</div>
      )}
    </div>
  );
}
