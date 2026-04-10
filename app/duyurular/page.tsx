"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Megaphone, Pencil, Trash2, Search, X, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Duyuru {
  id: string; baslik: string; icerik: string; tarih: string; hedef: string; yayinda: boolean;
}

const HEDEF_LABEL: Record<string, string> = {
  Tumu: "Tüm Kiracılar", Etap1: "1. Etap", Etap2: "2. Etap", Etap3: "3. Etap",
};

function DuyuruModal({ initial, onClose, onSaved }: { initial?: Duyuru; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    baslik: initial?.baslik ?? "",
    icerik: initial?.icerik ?? "",
    hedef: initial?.hedef ?? "Tumu",
    yayinda: initial?.yayinda ?? true,
  });
  const [hata, setHata] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.baslik || !form.icerik) { setHata("Başlık ve içerik zorunludur."); return; }
    setSaving(true); setHata("");
    const url = initial ? `/api/duyurular/${initial.id}` : "/api/duyurular";
    const res = await fetch(url, { method: initial ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); } else setHata("Hata oluştu.");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{initial ? "Duyuru Düzenle" : "Yeni Duyuru"}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div><label className="text-xs text-gray-500">Başlık</label>
            <input value={form.baslik} onChange={e => setForm(f => ({ ...f, baslik: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Duyuru başlığı..." />
          </div>
          <div><label className="text-xs text-gray-500">İçerik</label>
            <textarea value={form.icerik} onChange={e => setForm(f => ({ ...f, icerik: e.target.value }))} rows={4} className="w-full border rounded-lg px-3 py-2 text-sm mt-1 resize-none" placeholder="Duyuru içeriği..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Hedef Kitle</label>
              <select value={form.hedef} onChange={e => setForm(f => ({ ...f, hedef: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                {Object.entries(HEDEF_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.yayinda ? "bg-emerald-500" : "bg-gray-300"}`}
                  onClick={() => setForm(f => ({ ...f, yayinda: !f.yayinda }))}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.yayinda ? "translate-x-4" : "translate-x-0"}`} />
                </div>
                <span className="text-sm text-gray-600">{form.yayinda ? "Yayında" : "Taslak"}</span>
              </label>
            </div>
          </div>
          {hata && <p className="text-red-600 text-xs bg-red-50 rounded px-3 py-2">{hata}</p>}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={save} disabled={saving} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60">
            {saving ? "Kaydediliyor..." : "Yayınla"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DuyurularPage() {
  const [duyurular, setDuyurular] = useState<Duyuru[]>([]);
  const [editItem, setEditItem] = useState<Duyuru | undefined>();
  const [modal, setModal] = useState(false);
  const [silOnay, setSilOnay] = useState<string | null>(null);
  const [arama, setArama] = useState("");
  const [hedefFiltre, setHedefFiltre] = useState("");

  const load = useCallback(() => fetch("/api/duyurular").then(r => r.json()).then(setDuyurular), []);
  useEffect(() => { load(); }, [load]);

  const sil = async (id: string) => {
    await fetch(`/api/duyurular/${id}`, { method: "DELETE" }); setSilOnay(null); load();
  };

  const toggleYayinda = async (d: Duyuru) => {
    await fetch(`/api/duyurular/${d.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ yayinda: !d.yayinda }) });
    load();
  };

  const fmtT = (d: string) => format(new Date(d), "d MMM yyyy", { locale: tr });

  const gosterilen = duyurular.filter(d => {
    const q = arama.toLowerCase();
    if (q && !d.baslik.toLowerCase().includes(q) && !d.icerik.toLowerCase().includes(q)) return false;
    if (hedefFiltre && d.hedef !== hedefFiltre) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={arama} onChange={e => setArama(e.target.value)} placeholder="Başlık veya içerik ara..."
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" />
        </div>
        <select value={hedefFiltre} onChange={e => setHedefFiltre(e.target.value)} className="border rounded-lg px-3 py-2 text-sm text-gray-600">
          <option value="">Tüm Hedefler</option>
          {Object.entries(HEDEF_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={() => { setEditItem(undefined); setModal(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
          <Plus size={16} /> Yeni Duyuru
        </button>
      </div>

      <p className="text-xs text-gray-400">{gosterilen.length} / {duyurular.length} duyuru — {duyurular.filter(d => d.yayinda).length} yayında</p>

      <div className="space-y-3">
        {gosterilen.map(d => (
          <div key={d.id} className={`bg-white rounded-xl p-5 shadow-sm border transition-colors ${d.yayinda ? "border-gray-100" : "border-dashed border-gray-200 opacity-70"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${d.yayinda ? "bg-emerald-100" : "bg-gray-100"}`}>
                  <Megaphone size={16} className={d.yayinda ? "text-emerald-600" : "text-gray-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{d.baslik}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{HEDEF_LABEL[d.hedef] ?? d.hedef}</span>
                    {!d.yayinda && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Taslak</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{d.icerik}</p>
                  <p className="text-xs text-gray-400 mt-2">{fmtT(d.tarih)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleYayinda(d)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700" title={d.yayinda ? "Yayından kaldır" : "Yayınla"}>
                  {d.yayinda ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => { setEditItem(d); setModal(true); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Pencil size={14} /></button>
                <button onClick={() => setSilOnay(d.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {gosterilen.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
            <p>Henüz duyuru yok</p>
          </div>
        )}
      </div>

      {modal && <DuyuruModal initial={editItem} onClose={() => { setModal(false); setEditItem(undefined); }} onSaved={load} />}

      {silOnay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <p className="text-gray-700 mb-4">Bu duyuruyu silmek istediğinize emin misiniz?</p>
            <div className="flex gap-3">
              <button onClick={() => setSilOnay(null)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
              <button onClick={() => sil(silOnay)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700">Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
