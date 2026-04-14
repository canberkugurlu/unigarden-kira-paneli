"use client";

import { useEffect, useState, useMemo } from "react";
import { History, Eye, X, Search, Filter, Check } from "lucide-react";

interface IslemLog {
  id: string;
  panel: string; modul: string; eylem: string;
  baslik: string; detay?: string | null;
  targetType?: string | null; targetId?: string | null;
  oncekiVeri?: string | null; sonrakiVeri?: string | null;
  geriAlindi: boolean; geriAlinmaTar?: string | null;
  geriAlanAd?: string | null;
  kullaniciAd?: string | null; kullaniciTip?: string | null;
  ipAdres?: string | null;
  olusturmaTar: string;
}

const PANEL_RENK: Record<string, string> = {
  muhasebe:    "bg-purple-100 text-purple-700",
  kira:        "bg-emerald-100 text-emerald-700",
  "ev-sahibi": "bg-blue-100 text-blue-700",
  kiraci:      "bg-orange-100 text-orange-700",
  kiralama:    "bg-violet-100 text-violet-700",
};

const EYLEM_RENK: Record<string, string> = {
  CREATE:       "bg-green-100 text-green-700",
  UPDATE:       "bg-blue-100 text-blue-700",
  DELETE:       "bg-red-100 text-red-700",
  BULK_IMPORT:  "bg-purple-100 text-purple-700",
  BULK_DELETE:  "bg-pink-100 text-pink-700",
};
const EYLEM_LABEL: Record<string, string> = {
  CREATE: "Eklendi", UPDATE: "Güncellendi", DELETE: "Silindi",
  BULK_IMPORT: "Toplu İçe Aktarım", BULK_DELETE: "Toplu Silme",
};

interface Facets { paneller: string[]; eylemler: string[]; moduller: string[]; }

export default function LoglarPage() {
  const [loglar, setLoglar]       = useState<IslemLog[]>([]);
  const [facets, setFacets]       = useState<Facets>({ paneller: [], eylemler: [], moduller: [] });
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");
  const [panelF, setPanelF] = useState("");
  const [modulF, setModulF] = useState("");
  const [eylemF, setEylemF] = useState("");
  const [fromStr, setFromStr] = useState("");
  const [toStr,   setToStr]   = useState("");
  const [secili, setSecili] = useState<IslemLog | null>(null);

  const load = () => {
    setYukleniyor(true);
    const params = new URLSearchParams();
    if (panelF) params.set("panel", panelF);
    if (modulF) params.set("modul", modulF);
    if (eylemF) params.set("eylem", eylemF);
    if (fromStr) params.set("from", fromStr);
    if (toStr)   params.set("to",   new Date(toStr + "T23:59:59").toISOString());
    if (arama)  params.set("q", arama);
    fetch(`/api/loglar?${params.toString()}`).then(r => r.ok ? r.json() : { loglar: [], facets: { paneller:[], eylemler:[], moduller:[] } })
      .then((d) => { setLoglar(d.loglar ?? []); setFacets(d.facets ?? facets); setYukleniyor(false); });
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const stats = useMemo(() => {
    const byPanel: Record<string, number> = {};
    const byEylem: Record<string, number> = {};
    for (const l of loglar) {
      byPanel[l.panel] = (byPanel[l.panel] ?? 0) + 1;
      byEylem[l.eylem] = (byEylem[l.eylem] ?? 0) + 1;
    }
    return { toplam: loglar.length, geriAlindi: loglar.filter(l => l.geriAlindi).length, byPanel, byEylem };
  }, [loglar]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <History size={20} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">İşlem Logları</h1>
          <p className="text-xs text-gray-500">Sistemdeki tüm panellerden yapılan işlemler — denetim & izleme</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Toplam Kayıt" value={stats.toplam} renk="text-gray-800" />
        <StatCard label="Geri Alınan"  value={stats.geriAlindi} renk="text-orange-600" />
        <StatCard label="Bu Hafta" value={loglar.filter(l => Date.now() - new Date(l.olusturmaTar).getTime() < 7*86400000).length} renk="text-emerald-600" />
        <StatCard label="Aktif Panel"  value={Object.keys(stats.byPanel).length} renk="text-blue-600" />
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
        <div className="md:col-span-2">
          <label className="text-[10px] text-gray-500 uppercase tracking-wide">Arama</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={arama} onChange={e => setArama(e.target.value)} placeholder="Başlık, kullanıcı..."
              className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wide">Panel</label>
          <select value={panelF} onChange={e => setPanelF(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">Tümü</option>
            {facets.paneller.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wide">Eylem</label>
          <select value={eylemF} onChange={e => setEylemF(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">Tümü</option>
            {facets.eylemler.map(e => <option key={e} value={e}>{EYLEM_LABEL[e] ?? e}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wide">Başlangıç</label>
          <input type="date" value={fromStr} onChange={e => setFromStr(e.target.value)} className="w-full border rounded-lg px-2 py-2 text-sm" />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wide">Bitiş</label>
          <input type="date" value={toStr} onChange={e => setToStr(e.target.value)} className="w-full border rounded-lg px-2 py-2 text-sm" />
        </div>
        <div className="md:col-span-6 flex justify-end">
          <button onClick={load} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2">
            <Filter size={14} /> Filtrele
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500">{loglar.length} kayıt</p>

      {yukleniyor ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : loglar.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <History size={40} className="mx-auto mb-3 opacity-30" />
          <p>Filtreye uyan log yok</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2.5 text-left">Tarih</th>
                <th className="px-4 py-2.5 text-left">Panel</th>
                <th className="px-4 py-2.5 text-left">Eylem</th>
                <th className="px-4 py-2.5 text-left">Açıklama</th>
                <th className="px-4 py-2.5 text-left">Kullanıcı</th>
                <th className="px-4 py-2.5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loglar.map(l => (
                <tr key={l.id} className={`hover:bg-gray-50 ${l.geriAlindi ? "opacity-60" : ""}`}>
                  <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(l.olusturmaTar).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PANEL_RENK[l.panel] ?? "bg-gray-100 text-gray-700"}`}>
                      {l.panel}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5">{l.modul}</p>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${EYLEM_RENK[l.eylem] ?? "bg-gray-100 text-gray-700"}`}>
                      {EYLEM_LABEL[l.eylem] ?? l.eylem}
                    </span>
                    {l.geriAlindi && <span className="ml-1 text-[10px] text-gray-500">↺</span>}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">{l.baslik}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {l.kullaniciAd ?? <span className="text-gray-300">—</span>}
                    {l.kullaniciTip && <span className="ml-1 text-[10px] text-gray-400">({l.kullaniciTip})</span>}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setSecili(l)} title="Detay" className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {secili && <DetayModal log={secili} onClose={() => setSecili(null)} />}
    </div>
  );
}

function StatCard({ label, value, renk }: { label: string; value: number; renk: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${renk}`}>{value}</p>
    </div>
  );
}

function DetayModal({ log, onClose }: { log: IslemLog; onClose: () => void }) {
  const onceki:  unknown = log.oncekiVeri  ? safeJSON(log.oncekiVeri)  : null;
  const sonraki: unknown = log.sonrakiVeri ? safeJSON(log.sonrakiVeri) : null;
  const hasOnceki  = onceki  != null;
  const hasSonraki = sonraki != null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-5 w-full max-w-2xl shadow-xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">{log.baslik}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{log.panel} · {log.modul} · {log.eylem} · {new Date(log.olusturmaTar).toLocaleString("tr-TR")}</p>
          </div>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        {log.detay && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-3">{log.detay}</p>}
        <dl className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="bg-gray-50 px-3 py-2 rounded-lg"><dt className="text-gray-400">Kullanıcı</dt><dd className="font-medium text-gray-700">{log.kullaniciAd ?? "—"} {log.kullaniciTip && `(${log.kullaniciTip})`}</dd></div>
          <div className="bg-gray-50 px-3 py-2 rounded-lg"><dt className="text-gray-400">Hedef</dt><dd className="font-mono text-[10px] text-gray-600 truncate">{log.targetType} · {log.targetId ?? "—"}</dd></div>
          {log.ipAdres && <div className="bg-gray-50 px-3 py-2 rounded-lg col-span-2"><dt className="text-gray-400">IP</dt><dd className="font-mono text-[10px] text-gray-600">{log.ipAdres}</dd></div>}
        </dl>
        {log.geriAlindi && (
          <div className="text-xs bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
            <Check size={13} className="text-emerald-600" />
            {log.geriAlinmaTar && new Date(log.geriAlinmaTar).toLocaleString("tr-TR")} tarihinde {log.geriAlanAd ?? "—"} tarafından geri alındı.
          </div>
        )}
        {hasOnceki && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Önceki Veri</p>
            <pre className="bg-red-50 text-red-900 text-[10px] p-3 rounded-lg overflow-x-auto max-h-48">{JSON.stringify(onceki, null, 2)}</pre>
          </div>
        )}
        {hasSonraki && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Sonraki Veri</p>
            <pre className="bg-green-50 text-green-900 text-[10px] p-3 rounded-lg overflow-x-auto max-h-48">{JSON.stringify(sonraki, null, 2)}</pre>
          </div>
        )}
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">Kapat</button>
        </div>
      </div>
    </div>
  );
}

function safeJSON(s: string): unknown | null { try { return JSON.parse(s) as unknown; } catch { return s; } }
