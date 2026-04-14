"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Workflow, Trash2, Play, X, GripVertical, ChevronRight, Check } from "lucide-react";

interface Adim {
  id?: string; sira: number; ad: string; aciklama?: string;
  panel: string; rol?: string; aksiyon: string;
}
interface Senaryo {
  id: string; ad: string; aciklama?: string | null;
  hedefModel: string; aktif: boolean;
  adimlar: Adim[];
  _count?: { akislar: number };
}

const PANEL_OPTS = [
  { v: "admin",     l: "Admin",        renk: "bg-emerald-500" },
  { v: "kiralama",  l: "Kiralama",     renk: "bg-violet-500" },
  { v: "muhasebe",  l: "Muhasebe",     renk: "bg-blue-500" },
  { v: "ev-sahibi", l: "Ev Sahibi",    renk: "bg-sky-500" },
  { v: "kiraci",    l: "Kiracı",       renk: "bg-orange-500" },
];
const AKSIYON_OPTS = [
  { v: "onay",         l: "Onay (tek yön)" },
  { v: "red-veya-onay",l: "Red / Onay kararı" },
  { v: "bildirim",     l: "Bildirim" },
  { v: "otomatik",     l: "Otomatik (script)" },
];
const HEDEF_OPTS = ["Genel", "Sozlesme", "Konut", "Ogrenci", "BakimTalebi", "Odeme"];

export default function Senaryolar() {
  const [senaryolar, setSenaryolar] = useState<Senaryo[]>([]);
  const [yeniModal, setYeniModal] = useState(false);
  const [silOnay, setSilOnay] = useState<string | null>(null);
  const [baslatModal, setBaslatModal] = useState<Senaryo | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  const load = () => {
    setYukleniyor(true);
    fetch("/api/senaryolar").then(r => r.json()).then(d => { setSenaryolar(d); setYukleniyor(false); });
  };
  useEffect(() => { load(); }, []);

  const sil = async (id: string) => {
    await fetch(`/api/senaryolar/${id}`, { method: "DELETE" });
    setSilOnay(null); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Workflow size={20} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Senaryolar</h1>
            <p className="text-xs text-gray-500">Çoklu adımlı iş akışları tasarla — tüm paneller boyunca otomasyon</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/senaryolar/akislar" className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
            <Play size={14} /> Aktif Akışlar
          </Link>
          <button onClick={() => setYeniModal(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
            <Plus size={16} /> Yeni Senaryo
          </button>
        </div>
      </div>

      {yukleniyor ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : senaryolar.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <Workflow size={40} className="mx-auto mb-3 opacity-30" />
          <p>Henüz senaryo tanımlanmamış. İlk senaryonu oluştur.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {senaryolar.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-800">{s.ad}</h3>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">{s.hedefModel}</span>
                    {!s.aktif && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">Pasif</span>}
                  </div>
                  {s.aciklama && <p className="text-xs text-gray-500">{s.aciklama}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setBaslatModal(s)} title="Başlat" className="p-1.5 rounded hover:bg-emerald-50 text-gray-400 hover:text-emerald-600"><Play size={14} /></button>
                  <button onClick={() => setSilOnay(s.id)} title="Sil" className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
              <AdimZinciri adimlar={s.adimlar} />
              <p className="text-[10px] text-gray-400 mt-2">{s.adimlar.length} adım · {s._count?.akislar ?? 0} akış başlatılmış</p>
            </div>
          ))}
        </div>
      )}

      {yeniModal && <YeniSenaryoModal onClose={() => setYeniModal(false)} onSaved={() => { setYeniModal(false); load(); }} />}
      {baslatModal && <BaslatModal senaryo={baslatModal} onClose={() => setBaslatModal(null)} onStarted={() => { setBaslatModal(null); load(); }} />}
      {silOnay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <p className="text-gray-700 mb-4">Bu senaryoyu silmek istediğinizden emin misiniz? Tüm akışları da silinecek.</p>
            <div className="flex gap-3">
              <button onClick={() => setSilOnay(null)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
              <button onClick={() => sil(silOnay)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm">Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdimZinciri({ adimlar }: { adimlar: Adim[] }) {
  const sorted = [...adimlar].sort((a, b) => a.sira - b.sira);
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {sorted.map((a, i) => {
        const meta = PANEL_OPTS.find(p => p.v === a.panel);
        return (
          <div key={a.id ?? i} className="flex items-center shrink-0">
            <div title={`${a.ad} · ${meta?.l} · ${a.aksiyon}`}
                 className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white ${meta?.renk ?? "bg-gray-500"}`}>
              <span className="font-semibold">{a.sira}</span>
              <span className="max-w-[110px] truncate">{a.ad}</span>
            </div>
            {i < sorted.length - 1 && <ChevronRight size={14} className="text-gray-300 mx-0.5" />}
          </div>
        );
      })}
    </div>
  );
}

function YeniSenaryoModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [ad, setAd] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [hedefModel, setHedefModel] = useState("Genel");
  const [adimlar, setAdimlar] = useState<Adim[]>([
    { sira: 1, ad: "", panel: "admin", aksiyon: "onay" },
  ]);
  const [saving, setSaving] = useState(false);
  const [hata, setHata] = useState("");

  const addAdim = () => setAdimlar(xs => [...xs, { sira: xs.length + 1, ad: "", panel: "admin", aksiyon: "onay" }]);
  const delAdim = (i: number) => setAdimlar(xs => xs.filter((_, idx) => idx !== i).map((a, idx) => ({ ...a, sira: idx + 1 })));
  const updateAdim = <K extends keyof Adim>(i: number, k: K, v: Adim[K]) => {
    setAdimlar(xs => xs.map((a, idx) => idx === i ? { ...a, [k]: v } : a));
  };
  const move = (i: number, dir: -1 | 1) => {
    setAdimlar(xs => {
      const n = [...xs]; const j = i + dir;
      if (j < 0 || j >= n.length) return n;
      [n[i], n[j]] = [n[j], n[i]];
      return n.map((a, idx) => ({ ...a, sira: idx + 1 }));
    });
  };

  const save = async () => {
    if (!ad.trim()) { setHata("Senaryo adı gerekli."); return; }
    if (adimlar.some(a => !a.ad.trim())) { setHata("Tüm adımların adı dolu olmalı."); return; }
    setSaving(true); setHata("");
    const res = await fetch("/api/senaryolar", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad, aciklama, hedefModel, adimlar }),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else { const j = await res.json().catch(() => ({})); setHata(j.error ?? "Hata"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Yeni Senaryo Tasarla</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500">Senaryo Adı</label>
              <input value={ad} onChange={e => setAd(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Yeni Kiracı Kiralama Akışı" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Hedef Model</label>
              <select value={hedefModel} onChange={e => setHedefModel(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                {HEDEF_OPTS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Açıklama (opsiyonel)</label>
            <textarea value={aciklama} onChange={e => setAciklama(e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Adımlar</label>
              <button onClick={addAdim} className="text-xs text-emerald-600 hover:underline flex items-center gap-1"><Plus size={12} /> Adım Ekle</button>
            </div>
            <div className="space-y-2">
              {adimlar.map((a, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">{a.sira}</span>
                    <input value={a.ad} onChange={e => updateAdim(i, "ad", e.target.value)} placeholder="Adım adı" className="flex-1 border rounded px-2 py-1.5 text-sm" />
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-gray-400 disabled:opacity-30"><GripVertical size={14} /></button>
                    <button onClick={() => delAdim(i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <select value={a.panel} onChange={e => updateAdim(i, "panel", e.target.value)} className="border rounded px-2 py-1.5 text-xs">
                      {PANEL_OPTS.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
                    </select>
                    <input value={a.rol ?? ""} onChange={e => updateAdim(i, "rol", e.target.value)} placeholder="Rol (ops.)" className="border rounded px-2 py-1.5 text-xs" />
                    <select value={a.aksiyon} onChange={e => updateAdim(i, "aksiyon", e.target.value)} className="border rounded px-2 py-1.5 text-xs">
                      {AKSIYON_OPTS.map(x => <option key={x.v} value={x.v}>{x.l}</option>)}
                    </select>
                  </div>
                  <textarea value={a.aciklama ?? ""} onChange={e => updateAdim(i, "aciklama", e.target.value)} rows={1}
                            placeholder="Açıklama (opsiyonel)" className="w-full border rounded px-2 py-1.5 text-xs" />
                </div>
              ))}
            </div>
          </div>

          {hata && <p className="text-red-600 text-xs bg-red-50 rounded px-3 py-2">{hata}</p>}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={save} disabled={saving} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2">
            <Check size={14} /> {saving ? "Kaydediliyor..." : "Senaryo Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BaslatModal({ senaryo, onClose, onStarted }: { senaryo: Senaryo; onClose: () => void; onStarted: () => void }) {
  const [baslik, setBaslik] = useState(senaryo.ad);
  const [hedefId, setHedefId] = useState("");
  const [notlar, setNotlar] = useState("");
  const [yapiyor, setYapiyor] = useState(false);
  const [hata, setHata] = useState("");

  const basla = async () => {
    setYapiyor(true); setHata("");
    const res = await fetch(`/api/senaryolar/${senaryo.id}/baslat`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baslik, hedefId: hedefId || undefined, notlar }),
    });
    setYapiyor(false);
    if (res.ok) onStarted();
    else { const j = await res.json().catch(() => ({})); setHata(j.error ?? "Hata"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Senaryo Başlat</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-600 mb-3">{senaryo.ad}</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Akış Başlığı</label>
            <input value={baslik} onChange={e => setBaslik(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Hedef ID (opsiyonel, örn. Sözleşme ID)</label>
            <input value={hedefId} onChange={e => setHedefId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1 font-mono text-xs" placeholder={senaryo.hedefModel} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Notlar</label>
            <textarea value={notlar} onChange={e => setNotlar(e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
          {hata && <p className="text-red-600 text-xs bg-red-50 rounded px-3 py-2">{hata}</p>}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={basla} disabled={yapiyor} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-1">
            <Play size={14} /> {yapiyor ? "Başlatılıyor..." : "Başlat"}
          </button>
        </div>
      </div>
    </div>
  );
}
