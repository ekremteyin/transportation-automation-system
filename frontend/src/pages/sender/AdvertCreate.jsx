import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdvert } from '../../api/advertApi';
import PageHeader from '../../components/common/PageHeader';

const cargoTypes = ['Ev Eşyası', 'Ticari Yük', 'Palet', 'Makine', 'Araç', 'Diğer'];
const cities = ['Adana','Ankara','Antalya','Bursa','Diyarbakır','Eskişehir','Gaziantep','İstanbul','İzmir','Kayseri','Konya','Mersin','Samsun','Trabzon'];

export default function AdvertCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cargoType: '', cargoWeight: '', originCity: '', originDistrict: '',
    destCity: '', destDistrict: '', transportDate: '', description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, transportDate: new Date(form.transportDate).toISOString() };
      await createAdvert(payload);
      navigate('/sender/adverts');
    } catch (err) {
      setError(err.response?.data?.error ?? 'İlan oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <PageHeader title="Yeni İlan Oluştur" subtitle="Taşıma talebinizi yayınlayın." />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">

        {/* Yük Türü + Ağırlık */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yük Türü *</label>
            <select value={form.cargoType} onChange={set('cargoType')} required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seçin</option>
              {cargoTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tahmini Ağırlık</label>
            <input type="text" value={form.cargoWeight} onChange={set('cargoWeight')}
              placeholder="ör. 500 kg, 2 ton"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Kalkış */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Kalkış Noktası *</label>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.originCity} onChange={set('originCity')} required
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Şehir seçin</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" value={form.originDistrict} onChange={set('originDistrict')}
              placeholder="İlçe (opsiyonel)"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Varış */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Varış Noktası *</label>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.destCity} onChange={set('destCity')} required
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Şehir seçin</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" value={form.destDistrict} onChange={set('destDistrict')}
              placeholder="İlçe (opsiyonel)"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Tarih */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Taşıma Tarihi *</label>
          <input type="date" value={form.transportDate} onChange={set('transportDate')} required
            min={new Date().toISOString().split('T')[0]}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ek Açıklama</label>
          <textarea value={form.description} onChange={set('description')} rows={3}
            placeholder="Özel gereksinimler, notlar..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition">
            {loading ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
          </button>
          <button type="button" onClick={() => navigate('/sender/adverts')}
            className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition">
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
