import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAdvertById, deleteAdvert } from '../../api/advertApi';
import { getAdvertOffers, acceptOffer, rejectOffer } from '../../api/offerApi';
import { getUserReviews } from '../../api/reviewApi';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import ReviewForm from '../../components/review/ReviewForm';
import LocationPicker from '../../components/map/LocationPicker';

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
      <span className="text-slate-500 text-sm w-44 shrink-0">{label}</span>
      <span className="text-slate-800 text-sm font-medium">{value ?? '—'}</span>
    </div>
  );
}

function formatDuration(min) {
  if (!min) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} dk`;
  if (m === 0) return `${h} sa`;
  return `${h} sa ${m} dk`;
}

function StarRating({ value }) {
  return (
    <span className="text-amber-400 text-sm">
      {'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}
      <span className="text-slate-500 ml-1 text-xs">{value > 0 ? value.toFixed(1) : 'Değerlendirme yok'}</span>
    </span>
  );
}

export default function AdvertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [advert, setAdvert] = useState(null);
  const [offers, setOffers] = useState([]);
  const [reviewed, setReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = () => {
    Promise.all([
      getAdvertById(id),
      getAdvertOffers(id).catch(() => ({ data: [] }))
    ]).then(async ([aRes, oRes]) => {
      setAdvert(aRes.data);
      setOffers(oRes.data);
      const accepted = oRes.data.find(o => o.status === 'Accepted');
      if (aRes.data.status === 'Completed' && accepted) {
        const revRes = await getUserReviews(accepted.carrierId).catch(() => ({ data: [] }));
        setReviewed(revRes.data.some(r => r.advertId === parseInt(id)));
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [id]);

  const handleDelete = async () => {
    if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) return;
    await deleteAdvert(id);
    navigate('/sender/adverts');
  };

  const handleAccept = async (offerId) => {
    if (!confirm('Bu teklifi kabul etmek istediğinize emin misiniz? Diğer teklifler reddedilecek.')) return;
    setActionLoading(offerId);
    try { await acceptOffer(offerId); loadData(); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (offerId) => {
    setActionLoading(offerId);
    try { await rejectOffer(offerId); loadData(); }
    finally { setActionLoading(null); }
  };

  if (loading) return <div className="p-6 text-slate-400">Yükleniyor...</div>;
  if (!advert) return <div className="p-6 text-slate-400">İlan bulunamadı.</div>;

  const pendingOffers = offers.filter(o => o.status === 'Pending');
  const acceptedOffer = offers.find(o => o.status === 'Accepted');

  return (
    <div className="p-6 max-w-3xl space-y-5">
      <PageHeader
        title="İlan Detayı"
        subtitle={`#${advert.id} · ${advert.originCity} → ${advert.destCity}`}
        action={
          <div className="flex items-center gap-2">
            {advert.status === 'Open' && (
              <>
                <Link to={`/sender/adverts/${id}/edit`}
                  className="px-3 py-1.5 rounded-lg text-sm border border-slate-300 text-slate-600 hover:bg-slate-50 transition">
                  Düzenle
                </Link>
                <button onClick={handleDelete}
                  className="px-3 py-1.5 rounded-lg text-sm border border-red-200 text-red-600 hover:bg-red-50 transition">
                  Sil
                </button>
              </>
            )}
          </div>
        }
      />

      {/* İlan bilgileri */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Durum</span>
          <StatusBadge status={advert.status} />
        </div>
        <div className="px-6 py-5 space-y-3">
          <InfoRow label="Yük Türü"        value={advert.cargoType} />
          <InfoRow label="Tahmini Ağırlık" value={advert.cargoWeight} />
          <InfoRow label="Kalkış"          value={`${advert.originCity}${advert.originDistrict ? ' / ' + advert.originDistrict : ''}`} />
          <InfoRow label="Varış"           value={`${advert.destCity}${advert.destDistrict ? ' / ' + advert.destDistrict : ''}`} />
          <InfoRow label="Taşıma Tarihi"   value={new Date(advert.transportDate).toLocaleDateString('tr-TR')} />
          <InfoRow label="İlan Tarihi"     value={new Date(advert.createdAt).toLocaleDateString('tr-TR')} />
          {advert.distanceKm != null && (
            <InfoRow label="Mesafe" value={`${advert.distanceKm} km`} />
          )}
          {advert.estimatedDurationMin != null && (
            <InfoRow label="Tahmini Sürüş" value={formatDuration(advert.estimatedDurationMin)} />
          )}
        </div>

        {/* Rota haritası */}
        {advert.originLat && advert.destLat && (
          <div className="overflow-hidden">
            <LocationPicker
              originLat={advert.originLat} originLng={advert.originLng}
              destLat={advert.destLat}     destLng={advert.destLng}
              originLabel={`${advert.originCity}${advert.originDistrict ? ' / ' + advert.originDistrict : ''}`}
              destLabel={`${advert.destCity}${advert.destDistrict ? ' / ' + advert.destDistrict : ''}`}
              height="300px"
            />
          </div>
        )}

        {advert.description && (
          <div className="px-6 py-4">
            <p className="text-xs text-slate-400 uppercase mb-1">Açıklama</p>
            <p className="text-sm text-slate-700">{advert.description}</p>
          </div>
        )}
      </div>

      {/* Kabul edilen teklif */}
      {acceptedOffer && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4">
          <p className="text-sm font-semibold text-emerald-700 mb-2">✅ Kabul Edilen Teklif</p>
          <p className="text-sm text-slate-700">
            <span className="font-medium">{acceptedOffer.carrierName}</span>
            {acceptedOffer.carrierVehicleType && ` · ${acceptedOffer.carrierVehicleType}`}
          </p>
          <p className="text-xl font-bold text-emerald-700 mt-1">
            ₺{acceptedOffer.price.toLocaleString('tr-TR')}
          </p>
          {acceptedOffer.estimatedDate && (
            <p className="text-xs text-slate-500 mt-1">
              Tahmini teslim: {new Date(acceptedOffer.estimatedDate).toLocaleDateString('tr-TR')}
            </p>
          )}
        </div>
      )}

      {/* Değerlendirme formu */}
      {advert.status === 'Completed' && acceptedOffer && !reviewed && (
        <ReviewForm
          advert={advert}
          carrierId={acceptedOffer.carrierId}
          onSuccess={() => { setReviewed(true); loadData(); }}
        />
      )}
      {advert.status === 'Completed' && reviewed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4 text-sm text-emerald-700 font-medium">
          ✅ Bu taşımayı değerlendirdiniz.
        </div>
      )}

      {/* Gelen teklifler */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">
            Gelen Teklifler
            {pendingOffers.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingOffers.length}
              </span>
            )}
          </h2>
        </div>

        {offers.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="text-3xl mb-2">📭</p>
            <p>Henüz teklif gelmedi.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {offers.map(o => (
              <div key={o.id} className={`px-5 py-4 ${o.status === 'Rejected' ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-slate-800">{o.carrierName}</span>
                      {o.carrierVehicleType && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{o.carrierVehicleType}</span>
                      )}
                      <StatusBadge status={o.status} />
                    </div>
                    <StarRating value={o.carrierRating} />
                    {o.note && <p className="text-sm text-slate-500 mt-1">"{o.note}"</p>}
                    {o.estimatedDate && (
                      <p className="text-xs text-slate-400 mt-1">
                        Tahmini teslim: {new Date(o.estimatedDate).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-slate-800">₺{o.price.toLocaleString('tr-TR')}</p>
                    {o.status === 'Pending' && advert.status === 'Open' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleAccept(o.id)}
                          disabled={actionLoading === o.id}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-60 transition">
                          Kabul Et
                        </button>
                        <button
                          onClick={() => handleReject(o.id)}
                          disabled={actionLoading === o.id}
                          className="border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-60 transition">
                          Reddet
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
