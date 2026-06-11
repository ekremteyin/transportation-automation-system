export default function StatCard({ label, value, icon, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-emerald-50 text-emerald-600',
    amber:  'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    teal:   'bg-teal-50 text-teal-600',
    rose:   'bg-rose-50 text-rose-600',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-slate-500 text-sm">{label}</p>
      </div>
    </div>
  );
}
