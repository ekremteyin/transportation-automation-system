import { useEffect, useState } from 'react';
import { getOpenAdverts } from '../../api/advertApi';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import OfferModal from '../../components/offer/OfferModal';

const cities = ['','Adana','Ankara','Antalya','Bursa','Diyarbakır','Eskişehir','Gaziantep','İstanbul','İzmir','Kayseri','Konya','Mersin','Samsun','Trabzon'];
const cargoTypes = ['','Ev Eşyası','Ticari Yük','Palet','Makine','Araç','Diğer'];

export default function OpenAdverts() {
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', cargoType: '', transportDate: '' });
  const [selectedAdvert, setSelectedAdvert] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const load = (f = filters) => {
    setLoading(true);
    const params = {};
    if (f.city) params.city = f.city;
    if (f.cargoType) params.cargoType = f.cargoType;
    if (f.transportDate) params.transportDate = f.transportDate;
    getOpenAdverts(params).then(r => setAdverts(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setF = (field) => (e) => setFilters(p => ({ ...p, [field]: e.target.value }));
  const handleFilter = (e) => { e.preventDefault(); load(); };
  const handleReset = () => {
    const reset = { city: '', cargoType: '', transportDate: '' };
    setFilters(reset);
    load(reset);
  };

  const handleOfferSuccess = () => {
    setSuccessId(selectedAdvert.id);
    setSelectedAdvert(null);
    setTimeout(() => setSuccessId(null), 3000);
  };

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader title="Açık İlanlar" subtitle="Teklif vermek istediğiniz ilanı seçin." />

      {/* Filtreler */}
      <form onSubmit={handleFilter}
        className="bg-white rounded-xl border border-slate-200 p-4 mb-5 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Şehir</label>
          <select value={filters.city} onChange={setF('city')}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36">
            {cities.map(c => <option key={c} value={c}>{c || 'Tümü'}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Yük Türü</label>
          <select value={filters.cargoType} onChange={setF('cargoType')}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36">
            {cargoTypes.map(t => <option key={t} value={t}>{t || 'Tümü'}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Tarih</label>
          <input type="date" value={filters.transportDate} onChange={setF('transportDate')}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          Filtrele
        </button>
        <button type="button" onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition">
          Temizle
        </button>
      </form>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Yükleniyor...</div>
        ) : adverts.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="text-4xl mb-2">🔍</p>
            <p>Filtrelere uygun ilan bulunamadı.</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-slate-100 text-xs text-slate-500">
              {adverts.length} ilan bulundu
            </div>
            <div className="divide-y divide-slate-100">
              {adverts.map(a => (
                <div key={a.id}
                  className={`px-5 py-4 transition ${successId === a.id ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-slate-800 text-base">
                          {a.originCity} → {a.destCity}
                        </span>
                        <StatusBadge status={a.status} />
                        {successId === a.id && (
                          <span className="text-xs text-emerald-600 font-medium">✓ Teklifiniz gönderildi!</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                        <span>📦 {a.cargoType}{a.cargoWeight ? ` · ${a.cargoWeight}` : ''}</span>
                        <span>📅 {new Date(a.transportDate).toLocaleDateString('tr-TR')}</span>
                        <span>👤 {a.senderName}</span>
                        {a.distanceKm != null && <span>🛣 {a.distanceKm} km</span>}
                        {a.offerCount > 0 && <span>💬 {a.offerCount} teklif</span>}
                      </div>
                      {a.description && (
                        <p className="text-sm text-slate-400 mt-1 line-clamp-1">{a.description}</p>
                      )}
                    </div>
                    {successId !== a.id && (
                      <button
                        onClick={() => setSelectedAdvert(a)}
                        className="shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                        Teklif Ver
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedAdvert && (
        <OfferModal
          advert={selectedAdvert}
          onClose={() => setSelectedAdvert(null)}
          onSuccess={handleOfferSuccess}
        />
      )}
    </div>
  );
}
