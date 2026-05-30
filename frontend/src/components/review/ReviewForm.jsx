import { useState } from 'react';
import { createReview } from '../../api/reviewApi';

export default function ReviewForm({ advert, carrierId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Lütfen bir puan seçin.'); return; }
    setLoading(true); setError('');
    try {
      await createReview({ advertId: advert.id, reviewedId: carrierId, rating, comment: comment || null });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error ?? 'Değerlendirme gönderilemedi.');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-5">
      <h3 className="font-semibold text-slate-800 mb-4">⭐ Taşımayı Değerlendir</h3>

      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 mb-2">Puan</p>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(star => (
              <button
                key={star} type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="text-3xl transition-transform hover:scale-110"
              >
                <span className={(hovered || rating) >= star ? 'text-amber-400' : 'text-slate-200'}>★</span>
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-slate-500 self-center">
                {['','Çok Kötü','Kötü','Orta','İyi','Mükemmel'][rating]}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Yorum (opsiyonel)</label>
          <textarea
            value={comment} onChange={e => setComment(e.target.value)} rows={3}
            placeholder="Taşıyıcı hakkındaki deneyiminizi paylaşın..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        <button type="submit" disabled={loading}
          className="bg-amber-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-60 transition">
          {loading ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
        </button>
      </form>
    </div>
  );
}
