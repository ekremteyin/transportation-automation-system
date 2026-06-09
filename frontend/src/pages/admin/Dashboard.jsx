import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { getAdminStats } from '../../api/adminApi';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-700 text-sm mb-4">{title}</h3>
      {children}
    </div>
  );
}

function StarBar({ rating }) {
  const full  = Math.round(rating);
  const empty = 5 - full;
  return (
    <span className="text-amber-400 text-sm">
      {'★'.repeat(full)}{'☆'.repeat(empty)}
    </span>
  );
}

const chartTooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="p-6">
        <PageHeader title="Admin Paneli" subtitle="Sistemin genel durumu." />
        <div className="text-slate-400 text-sm mt-6">Yükleniyor...</div>
      </div>
    );
  }

  const maxCityCount = stats.topCitiesByAdverts[0]?.count ?? 1;

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <PageHeader title="Admin Paneli" subtitle="Sistemin genel durumu." />

      {/* ── Sayı Kartları ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Toplam Kullanıcı"  value={stats.totalUsers}        icon="👥" color="blue" />
        <StatCard label="Gönderici"          value={stats.totalSenders}      icon="📦" color="purple" />
        <StatCard label="Taşıyıcı"           value={stats.totalCarriers}     icon="🚛" color="amber" />
        <StatCard label="Toplam Teklif"      value={stats.totalOffers}       icon="💬" color="purple" />
        <StatCard label="Toplam İlan"        value={stats.totalAdverts}      icon="📋" color="blue" />
        <StatCard label="Açık İlan"          value={stats.openAdverts}       icon="🟢" color="green" />
        <StatCard label="Tamamlanan"         value={stats.completedAdverts}  icon="✅" color="green" />
      </div>

      {/* ── Grafikler ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Son 6 Ay — Kullanıcı Kayıtları">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.monthlyUserRegistrations} barSize={30} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(v) => [v, 'Kullanıcı']}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Son 6 Ay — İlan Oluşturma">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.monthlyAdvertCreations} barSize={30} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(v) => [v, 'İlan']}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* ── Listeler ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* En çok ilan oluşturulan şehirler */}
        <SectionCard title="En Çok İlan Oluşturulan Şehirler">
          {stats.topCitiesByAdverts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Henüz ilan yok.</p>
          ) : (
            <div className="space-y-3">
              {stats.topCitiesByAdverts.map((c, i) => (
                <div key={c.city} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700">{c.city}</span>
                      <span className="text-xs text-slate-400">{c.count} ilan</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(c.count / maxCityCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* En yüksek puanlı taşıyıcılar */}
        <SectionCard title="En Yüksek Puanlı Taşıyıcılar">
          {stats.topRatedCarriers.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Henüz değerlendirme yok.</p>
          ) : (
            <div className="space-y-3">
              {stats.topRatedCarriers.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{c.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarBar rating={c.rating} />
                      <span className="text-xs text-slate-500">
                        {c.rating.toFixed(1)} · {c.ratingCount} değerlendirme
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

      </div>
    </div>
  );
}
