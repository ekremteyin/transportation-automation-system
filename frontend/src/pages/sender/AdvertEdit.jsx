import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdvertById, updateAdvert } from '../../api/advertApi';
import PageHeader from '../../components/common/PageHeader';

const cargoTypes = ['Ev Eşyası', 'Ticari Yük', 'Palet', 'Makine', 'Araç', 'Diğer'];
const cities = ['Adana','Ankara','Antalya','Bursa','Diyarbakır','Eskişehir','Gaziantep','İstanbul','İzmir','Kayseri','Konya','Mersin','Samsun','Trabzon'];

export default function AdvertEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAdvertById(id).then(r => {
      const a = r.data;
      setForm({
        cargoType: a.cargoType, cargoWeight: a.cargoWeight ?? '',
        originCity: a.originCity, originDistrict: a.originDistrict ?? '',
        destCity: a.destCity, destDistrict: a.destDistrict ?? '',
        transportDate: a.transportDate.split('T')[0],
        description: a.description ?? '',
      });
    });
  }, [id]);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await updateAdvert(id, { ...form, transportDate: new Date(form.transportDate).toISOString() });
      navigate(`/sender/adverts/${id}`);
    } catch (err) {
      setError(err.response?.data?.error ?? 'Güncelleme başarısız.');
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <div className="p-6 text-slate-400">Yükleniyor...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <PageHeader title="İlanı Düzenle" />
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yük Türü *</label>
            <select value={form.cargoType} onChange={set('cargoType')} required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {cargoTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tahmini Ağırlık</label>
            <input type="text" value={form.cargoWeight} onChange={set('cargoWeight')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Kalkış *</label>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.originCity} onChange={set('originCity')} required
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" value={form.originDistrict} onChange={set('originDistrict')} placeholder="İlçe"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Varış *</label>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.destCity} onChange={set('destCity')} required
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" value={form.destDistrict} onChange={set('destDistrict')} placeholder="İlçe"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Taşıma Tarihi *</label>
          <input type="date" value={form.transportDate} onChange={set('transportDate')} required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
          <textarea value={form.description} onChange={set('description')} rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition">
            {loading ? 'Kaydediliyor...' : 'Güncelle'}
          </button>
          <button type="button" onClick={() => navigate(`/sender/adverts/${id}`)}
            className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition">
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
