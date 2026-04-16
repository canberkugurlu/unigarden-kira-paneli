"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, Clock, FileText, User, Home, X } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Onay { onaylayan: string; onaylayanAd: string; tarih: string; }
interface Sozlesme {
  id: string; sozlesmeNo: string; durum: string;
  aylikKira: number; depozito: number;
  baslangicTarihi: string; bitisTarihi: string;
  konut: { daireNo: string; blok: string };
  ogrenci: { ad: string; soyad: string; telefon: string };
  onaylar: Onay[];
}

const ONAYLAYANLAR = [
  { key: "KiralamaSorumlusu", label: "Kiralama Sorumlusu" },
  { key: "Muhasebeci", label: "Muhasebe" },
  { key: "Admin", label: "Admin (Siz)" },
];

const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);
const fmtT = (d: string) => format(new Date(d), "d MMM yyyy", { locale: tr });

function OnayModal({ sozlesme, onClose, onOnaylandi }: { sozlesme: Sozlesme; onClose: () => void; onOnaylandi: () => void }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  const onayla = async () => {
    setYukleniyor(true); setHata("");
    const res = await fetch("/api/sozlesme-onay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sozlesmeId: sozlesme.id }),
    });
    const j = await res.json();
    if (!res.ok) { setHata(j.error ?? "Hata oluştu."); setYukleniyor(false); return; }
    onOnaylandi();
    onClose();
  };

  const adminOnay = sozlesme.onaylar.find(o => o.onaylayan === "Admin");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={16} className="text-blue-600" /> Sözleşme Onayı
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-gray-400" />
              <span className="font-medium">{sozlesme.ogrenci.ad} {sozlesme.ogrenci.soyad}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Home size={14} className="text-gray-400" />
              <span>{sozlesme.konut.daireNo} — {sozlesme.konut.blok} Blok</span>
            </div>
            <div className="text-sm text-emerald-600 font-medium">{fmt(sozlesme.aylikKira)} / ay</div>
            <div className="text-xs text-gray-500">{fmtT(sozlesme.baslangicTarihi)} — {fmtT(sozlesme.bitisTarihi)}</div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Onay Durumu</p>
            {ONAYLAYANLAR.map(({ key, label }) => {
              const onay = sozlesme.onaylar.find(o => o.onaylayan === key);
              return (
                <div key={key} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${onay ? "bg-emerald-500" : "bg-gray-300"}`} />
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                  {onay ? (
                    <span className="text-xs text-emerald-600 font-medium">✓ {fmtT(onay.tarih)}</span>
                  ) : (
                    <span className="text-xs text-gray-400">Bekliyor</span>
                  )}
                </div>
              );
            })}
          </div>

          {hata && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{hata}</p>}
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">Kapat</button>
          {!adminOnay && (
            <button onClick={onayla} disabled={yukleniyor}
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {yukleniyor ? "Onaylanıyor…" : "Admin Olarak Onayla"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SozlesmeOnayPage() {
  const [sozlesmeler, setSozlesmeler] = useState<Sozlesme[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secili, setSecili] = useState<Sozlesme | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    const r = await fetch("/api/sozlesme-onay");
    if (r.ok) setSozlesmeler(await r.json());
    setYukleniyor(false);
  }, []);

  useEffect(() => { yukle(); }, [yukle]);

  const bekleyenler = sozlesmeler.filter(s => s.durum === "ImzalandiOnayBekliyor");
  const onaylananlar = sozlesmeler.filter(s => s.durum === "OnaylandiAktifBekliyor");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sözleşme Onayları</h1>
        <p className="text-sm text-gray-500 mt-1">İmzalanmış sözleşmelerin 3 taraflı onay süreci</p>
      </div>

      {yukleniyor ? (
        <div className="text-center py-12 text-gray-400 text-sm">Yükleniyor…</div>
      ) : (
        <>
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              Onay Bekleyen ({bekleyenler.length})
            </h2>
            {bekleyenler.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
                Onay bekleyen sözleşme yok.
              </div>
            )}
            {bekleyenler.map(s => {
              const onayCount = s.onaylar.length;
              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{s.ogrenci.ad} {s.ogrenci.soyad}</span>
                      <span className="text-xs text-gray-400">{s.sozlesmeNo}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{s.konut.daireNo}</span>
                      <span className="text-emerald-600 font-medium">{fmt(s.aylikKira)}/ay</span>
                      <span>{fmtT(s.baslangicTarihi)}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {ONAYLAYANLAR.map(({ key }) => {
                        const onay = s.onaylar.find(o => o.onaylayan === key);
                        return (
                          <span key={key} className={`w-2 h-2 rounded-full ${onay ? "bg-emerald-500" : "bg-gray-200"}`} title={key} />
                        );
                      })}
                      <span className="text-xs text-gray-400 ml-1">{onayCount}/3 onay</span>
                    </div>
                  </div>
                  <button onClick={() => setSecili(s)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 whitespace-nowrap">
                    İncele & Onayla
                  </button>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              Tüm Onaylar Tamamlandı ({onaylananlar.length})
            </h2>
            {onaylananlar.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-emerald-200 p-4 flex items-center justify-between opacity-75">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">{s.ogrenci.ad} {s.ogrenci.soyad}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Onaylandı</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {s.konut.daireNo} · Başlangıç: {fmtT(s.baslangicTarihi)}
                  </div>
                </div>
                <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </>
      )}

      {secili && (
        <OnayModal
          sozlesme={secili}
          onClose={() => setSecili(null)}
          onOnaylandi={yukle}
        />
      )}
    </div>
  );
}
