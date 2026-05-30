import { useState } from 'react';
import { createOffer } from '../../api/offerApi';

export default function OfferModal({ advert, onClose, onSuccess }) {
  const [form, setForm] = useState({ price: '', estimatedDate: '', note: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createOffer({
        advertId: advert.id,
        price: parseFloat(form.price),
        estimatedDate: form.estimatedDate ? new Date(form.estimatedDate).toISOString() : null,
        note: form.note || null,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error ?? 'Teklif gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">Teklif Ver</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
        </div>

        {/* İlan özeti */}
        <div className="bg-slate-50 rounded-xl px-4 py-3 mb-5 text-sm">
          <p className="font-semibold text-slate-700">{advert.originCity} → {advert.destCity}</p>
          <p className="text-slate-500">{advert.cargoType} · {new Date(advert.transportDate).toLocaleDateString('tr-TR')}</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fiyat Teklifiniz (₺) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₺</span>
              <input
                type="number" min="1" step="0.01"
                value={form.price} onChange={set('price')} required
                className="w-full border border-slate-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tahmini Teslim Tarihi</label>
            <input
              type="date" value={form.estimatedDate} onChange={set('estimatedDate')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Not (opsiyonel)</label>
            <textarea
              value={form.note} onChange={set('note')} rows={3}
              placeholder="Deneyiminiz, araç bilgisi vb."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition">
              {loading ? 'Gönderiliyor...' : 'Teklifi Gönder'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition">
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
