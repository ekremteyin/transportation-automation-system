const styles = {
  Open:       'bg-emerald-100 text-emerald-700',
  Matched:    'bg-blue-100 text-blue-700',
  InProgress: 'bg-amber-100 text-amber-700',
  Completed:  'bg-slate-100 text-slate-600',
  Cancelled:  'bg-red-100 text-red-600',
  Pending:    'bg-yellow-100 text-yellow-700',
  Accepted:   'bg-green-100 text-green-700',
  Rejected:   'bg-red-100 text-red-600',
};

const labels = {
  Open: 'Açık', Matched: 'Eşleşti', InProgress: 'Taşınıyor',
  Completed: 'Tamamlandı', Cancelled: 'İptal',
  Pending: 'Bekliyor', Accepted: 'Kabul', Rejected: 'Reddedildi',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[status] ?? status}
    </span>
  );
}
