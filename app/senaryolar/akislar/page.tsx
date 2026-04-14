"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Check, X, ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";

interface AdimIcEvi {
  id: string; adimId: string; sira: number; durum: string;
  yapanAd?: string | null; yapilanTar?: string | null; notlar?: string | null;
  adim: { ad: string; panel: string; rol?: string | null; aksiyon: string };
}
interface Akis {
  id: string; baslik: string; durum: string; aktifSira: number;
  hedefModel: string; hedefId?: string | null;
  baslayanAd?: string | null; baslamaTar: string; bitirmeTar?: string | null;
  senaryo: { ad: string; hedefModel: string };
  adimlar: AdimIcEvi[];
}

const DURUM_RENK: Record<string, string> = {
  Aktif:       "bg-blue-100 text-blue-700",
  Tamamlandi:  "bg-green-100 text-green-700",
  Reddedildi:  "bg-red-100 text-red-700",
  Iptal:       "bg-gray-100 text-gray-600",
  Beklemede:   "bg-gray-100 text-gray-500",
};

export default function AkislarPage() {
  const [akislar, setAkislar] = useState<Akis[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtre, setFiltre] = useState<"tumu" | "Aktif" | "Tamamlandi" | "Reddedildi">("Aktif");
  const [detay, setDetay] = useState<Akis | null>(null);

  const load = () => {
    setYukleniyor(true);
    const q = filtre === "tumu" ? "" : `?durum=${filtre}`;
    fetch(`/api/akislar${q}`).then(r => r.json()).then((d: Akis[]) => { setAkislar(d); setYukleniyor(false); });
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filtre]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/senaryolar" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={16} /></Link>
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Play size={18} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Senaryo Akışları</h1>
          <p className="text-xs text-gray-500">Başlatılmış ve yürütülmekte olan iş akışları</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(["Aktif", "Tamamlandi", "Reddedildi", "tumu"] as const).map(d => (
          <button key={d} onClick={() => setFiltre(d)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${filtre === d ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {d === "tumu" ? "Tümü" : d}
          </button>
        ))}
      </div>

      {yukleniyor ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : akislar.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <Play size={40} className="mx-auto mb-3 opacity-30" />
          <p>Akış yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {akislar.map(a => (
            <AkisCard key={a.id} akis={a} onSelect={() => setDetay(a)} />
          ))}
        </div>
      )}

      {detay && <AkisDetayModal akis={detay} onClose={() => setDetay(null)} onUpdated={() => { setDetay(null); load(); }} />}
    </div>
  );
}

function AkisCard({ akis, onSelect }: { akis: Akis; onSelect: () => void }) {
  const tamamlanan = akis.adimlar.filter(x => x.durum === "Tamamlandi").length;
  const yuzde = Math.round((tamamlanan / akis.adimlar.length) * 100);
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-emerald-200 cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-800">{akis.baslik}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${DURUM_RENK[akis.durum]}`}>{akis.durum}</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">{akis.senaryo.ad}</span>
          </div>
          <p className="text-xs text-gray-500">
            Başlatan: {akis.baslayanAd ?? "—"} · {new Date(akis.baslamaTar).toLocaleString("tr-TR")}
            {akis.hedefId && ` · Hedef: ${akis.hedefId.slice(0, 8)}...`}
          </p>
        </div>
      </div>
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {akis.adimlar.map(a => (
            <AdimRozeti key={a.id} adim={a} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${yuzde}%` }} />
          </div>
          <span className="text-[10px] text-gray-500 shrink-0">{tamamlanan}/{akis.adimlar.length}</span>
        </div>
      </div>
    </div>
  );
}

function AdimRozeti({ adim }: { adim: AdimIcEvi }) {
  const ikon = adim.durum === "Tamamlandi" ? <CheckCircle2 size={12} /> : adim.durum === "Reddedildi" ? <XCircle size={12} /> : adim.durum === "Aktif" ? <Clock size={12} /> : null;
  const renk = adim.durum === "Tamamlandi" ? "bg-green-100 text-green-700" :
               adim.durum === "Aktif" ? "bg-blue-100 text-blue-700 animate-pulse" :
               adim.durum === "Reddedildi" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500";
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 ${renk}`} title={`${adim.sira}. ${adim.adim.ad} — ${adim.durum}`}>
      {ikon}{adim.sira}. {adim.adim.ad}
    </span>
  );
}

function AkisDetayModal({ akis, onClose, onUpdated }: { akis: Akis; onClose: () => void; onUpdated: () => void }) {
  const [notlar, setNotlar] = useState("");
  const [yapiyor, setYapiyor] = useState(false);
  const aktif = akis.adimlar.find(a => a.durum === "Aktif");

  const karar = async (k: "onay" | "red") => {
    if (!aktif) return;
    setYapiyor(true);
    await fetch(`/api/akislar/${akis.id}/adim`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adimId: aktif.adimId, karar: k, notlar }),
    });
    setYapiyor(false);
    onUpdated();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{akis.baslik}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{akis.senaryo.ad} · {akis.durum}</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="space-y-2 mb-4">
          {akis.adimlar.sort((a, b) => a.sira - b.sira).map(a => (
            <div key={a.id} className={`flex items-start gap-3 p-3 rounded-lg ${a.durum === "Aktif" ? "bg-blue-50 border border-blue-200" : "bg-gray-50"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                a.durum === "Tamamlandi" ? "bg-green-500 text-white" :
                a.durum === "Reddedildi" ? "bg-red-500 text-white" :
                a.durum === "Aktif" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
              }`}>{a.sira}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-800 text-sm">{a.adim.ad}</p>
                  <span className="text-[10px] bg-white text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200">{a.adim.panel}</span>
                  {a.adim.rol && <span className="text-[10px] bg-white text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200">{a.adim.rol}</span>}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${DURUM_RENK[a.durum]}`}>{a.durum}</span>
                </div>
                {a.yapanAd && <p className="text-xs text-gray-500 mt-1">{a.yapanAd} · {a.yapilanTar && new Date(a.yapilanTar).toLocaleString("tr-TR")}</p>}
                {a.notlar && <p className="text-xs text-gray-600 mt-1 bg-white rounded px-2 py-1 border border-gray-200">{a.notlar}</p>}
              </div>
            </div>
          ))}
        </div>

        {aktif && akis.durum === "Aktif" && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Aktif Adımı İşle: {aktif.adim.ad}</p>
            <textarea value={notlar} onChange={e => setNotlar(e.target.value)} rows={2}
                      placeholder="Notlar (opsiyonel)"
                      className="w-full border rounded-lg px-3 py-2 text-sm mb-2" />
            <div className="flex gap-2">
              {aktif.adim.aksiyon === "red-veya-onay" && (
                <button onClick={() => karar("red")} disabled={yapiyor}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 flex items-center justify-center gap-2">
                  <XCircle size={14} /> Reddet
                </button>
              )}
              <button onClick={() => karar("onay")} disabled={yapiyor}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700 flex items-center justify-center gap-2">
                <Check size={14} /> {yapiyor ? "İşleniyor..." : "Onayla / Tamamla"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
