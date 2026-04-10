"use client";

import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Pencil, FileText, UserCheck, ChevronDown, ChevronUp,
  X, Check, Download, Upload, Search, LayoutGrid, List, SlidersHorizontal,
} from "lucide-react";
import * as XLSX from "xlsx";

// ─── Tipler ───────────────────────────────────────────────────────────────────
interface DaireSahibi { id: string; ad: string; soyad: string }
interface Sozlesme    { id: string; durum: string; aylikKira: number; oda?: string; ogrenci?: { id: string; ad: string; soyad: string; telefon: string } }
interface Ogrenci    { id: string; ad: string; soyad: string }

interface Konut {
  id: string; blok: string; katNo: number; daireNo: string;
  tip: string; metrekare: number; kiraBedeli: number;
  durum: string; etap: number; ozellikler?: string;
  daireSahibi?: DaireSahibi;
  sozlesmeler?: Sozlesme[];
}

// ─── Sabitler ─────────────────────────────────────────────────────────────────
const DURUM_RENK: Record<string, string> = {
  Dolu: "bg-red-100 text-red-700", Bos: "bg-green-100 text-green-700", Bakimda: "bg-yellow-100 text-yellow-700",
};
const DURUM_LABEL: Record<string, string> = { Dolu: "Dolu", Bos: "Boş", Bakimda: "Bakımda" };
const ETAP_LABEL:  Record<number, string>  = { 1: "1. Etap", 2: "2. Etap", 3: "3. Etap" };

const EK_OZELLIKLER = [
  "Eşyalı", "Klimalı", "Balkonlu", "Asansörlü", "Güvenlikli",
  "Doğalgaz", "Otopark", "İnternet", "Kablolu TV", "Engelli Erişimi",
];

function getParentBlok(blok: string) { return blok.startsWith("A") ? "A" : blok; }

function sortDaireler(konutlar: Konut[]) {
  return [...konutlar].sort((a, z) => {
    if (a.blok !== z.blok) return a.blok.localeCompare(z.blok);
    const parse = (d: string) => { const p = d.split("-").pop() ?? d; return { num: parseInt(p, 10) || 0, ltr: p.replace(/\d+/, "") }; };
    const av = parse(a.daireNo), zv = parse(z.daireNo);
    return av.num !== zv.num ? av.num - zv.num : av.ltr.localeCompare(zv.ltr);
  });
}

function parseOzellikler(raw?: string): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return raw.split(",").map(s => s.trim()).filter(Boolean); }
}

function serializeOzellikler(list: string[]): string {
  return JSON.stringify(list);
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({
  konut, onClose, onSaved, onSozlesmeAc, onSahibiAc,
}: {
  konut: Konut;
  onClose: () => void;
  onSaved: () => void;
  onSozlesmeAc: () => void;
  onSahibiAc: () => void;
}) {
  const [sahipler, setSahipler] = useState<DaireSahibi[]>([]);
  const [seciliOzellikler, setSeciliOzellikler] = useState<string[]>(parseOzellikler(konut.ozellikler));

  // Aktif sözleşme varsa kirayı oradan al, yoksa konutun kira bedelini kullan
  const aktifSozlesme = konut.sozlesmeler?.find(s => s.durum === "Aktif");
  const basKira = aktifSozlesme ? String(aktifSozlesme.aylikKira) : String(konut.kiraBedeli);

  const [form, setForm] = useState({
    tip:           konut.tip,
    metrekare:     String(konut.metrekare),
    kiraBedeli:    basKira,
    durum:         konut.durum,
    etap:          String(konut.etap),
    daireSahibiId: konut.daireSahibi?.id ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/daire-sahipleri").then(r => r.json()).then(setSahipler);
  }, []);

  const toggleOzellik = (o: string) =>
    setSeciliOzellikler(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/konutlar/${konut.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tip:          form.tip,
        metrekare:    Number(form.metrekare),
        kiraBedeli:   Number(form.kiraBedeli),
        durum:        form.durum,
        etap:         Number(form.etap),
        daireSahibiId: form.daireSahibiId || null,
        ozellikler:   serializeOzellikler(seciliOzellikler),
      }),
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Daire {konut.daireNo} Düzenle</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        {/* Hızlı İşlemler */}
        <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
          <button
            onClick={() => { onClose(); onSozlesmeAc(); }}
            disabled={konut.durum === "Dolu"}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FileText size={13} /> Sözleşme Ekle
          </button>
          <button
            onClick={() => { onClose(); onSahibiAc(); }}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <UserCheck size={13} /> Daire Sahibi
          </button>
        </div>

        <div className="space-y-3">
          {/* Tip / m² */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Daire Tipi</label>
              <select value={form.tip} onChange={e => setForm(f => ({ ...f, tip: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                <option>1+1</option><option>2+1</option><option>3+1</option><option>Stüdyo</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Metrekare</label>
              <input type="number" value={form.metrekare}
                onChange={e => setForm(f => ({ ...f, metrekare: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
          </div>

          {/* Kira */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-500">Aylık Kira (₺)</label>
              {aktifSozlesme && (
                <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                  Aktif sözleşmeden
                </span>
              )}
            </div>
            <input
              type="number"
              value={form.kiraBedeli}
              onChange={e => setForm(f => ({ ...f, kiraBedeli: e.target.value }))}
              readOnly={!!aktifSozlesme}
              className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${
                aktifSozlesme ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* Durum / Etap */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Durum</label>
              <select value={form.durum} onChange={e => setForm(f => ({ ...f, durum: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                <option value="Bos">Boş</option>
                <option value="Dolu">Dolu</option>
                <option value="Bakimda">Bakımda</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Etap</label>
              <select value={form.etap} onChange={e => setForm(f => ({ ...f, etap: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                <option value="1">1. Etap</option>
                <option value="2">2. Etap</option>
                <option value="3">3. Etap</option>
              </select>
            </div>
          </div>

          {/* Daire Sahibi */}
          <div>
            <label className="text-xs text-gray-500">Daire Sahibi</label>
            <select value={form.daireSahibiId}
              onChange={e => setForm(f => ({ ...f, daireSahibiId: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
              <option value="">— Sahip seçin —</option>
              {sahipler.map(s => (
                <option key={s.id} value={s.id}>{s.ad} {s.soyad}</option>
              ))}
            </select>
          </div>

          {/* Ek Özellikler */}
          <div>
            <label className="text-xs text-gray-500 block mb-2">Ek Özellikler</label>
            <div className="flex flex-wrap gap-2">
              {EK_OZELLIKLER.map(o => {
                const secili = seciliOzellikler.includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => toggleOzellik(o)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      secili
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-emerald-400"
                    }`}
                  >
                    {secili && <Check size={10} className="inline mr-1" />}{o}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={save} disabled={saving}
            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sözleşme Modalı ──────────────────────────────────────────────────────────
function SozlesmeModal({
  konut, onClose, onSaved, oda,
}: { konut: Konut; onClose: () => void; onSaved: () => void; oda?: string }) {
  const [ogrenciler, setOgrenciler] = useState<Ogrenci[]>([]);
  const [form, setForm] = useState({
    ogrenciId: "", baslangicTarihi: "", bitisTarihi: "",
    aylikKira: String(konut.kiraBedeli), depozito: "0", kiraOdemGunu: "1", ozelSartlar: "",
  });
  const [hata, setHata] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/ogrenciler").then(r => r.json()).then(setOgrenciler); }, []);

  const save = async () => {
    setSaving(true); setHata("");
    const res = await fetch("/api/sozlesmeler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form, konutId: konut.id,
        aylikKira: Number(form.aylikKira), depozito: Number(form.depozito),
        kiraOdemGunu: Number(form.kiraOdemGunu),
        ...(oda ? { oda } : {}),
      }),
    });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const j = await res.json(); setHata(j.error ?? "Hata oluştu"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Sözleşme Ekle — {konut.daireNo}{oda ? ` / ${oda}` : ""}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Kiracı</label>
            <select value={form.ogrenciId} onChange={e => setForm(f => ({ ...f, ogrenciId: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
              <option value="">— Kiracı seçin —</option>
              {ogrenciler.map(o => <option key={o.id} value={o.id}>{o.ad} {o.soyad}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Başlangıç</label>
              <input type="date" value={form.baslangicTarihi}
                onChange={e => setForm(f => ({ ...f, baslangicTarihi: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Bitiş</label>
              <input type="date" value={form.bitisTarihi}
                onChange={e => setForm(f => ({ ...f, bitisTarihi: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500">Kira (₺)</label>
              <input type="number" value={form.aylikKira}
                onChange={e => setForm(f => ({ ...f, aylikKira: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Depozito</label>
              <input type="number" value={form.depozito}
                onChange={e => setForm(f => ({ ...f, depozito: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Ödeme Günü</label>
              <input type="number" min={1} max={28} value={form.kiraOdemGunu}
                onChange={e => setForm(f => ({ ...f, kiraOdemGunu: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Özel Şartlar</label>
            <textarea rows={2} value={form.ozelSartlar}
              onChange={e => setForm(f => ({ ...f, ozelSartlar: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
          {hata && <p className="text-red-600 text-xs bg-red-50 rounded px-3 py-2">{hata}</p>}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={save} disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Kaydediliyor..." : "Sözleşme Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sahip Atama Modalı ───────────────────────────────────────────────────────
function SahibiModal({
  konut, onClose, onSaved,
}: { konut: Konut; onClose: () => void; onSaved: () => void }) {
  const [sahipler, setSahipler] = useState<DaireSahibi[]>([]);
  const [secilen, setSecilen] = useState(konut.daireSahibi?.id ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/daire-sahipleri").then(r => r.json()).then(setSahipler); }, []);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/konutlar/${konut.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daireSahibiId: secilen || null }),
    });
    setSaving(false); onSaved(); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Sahip Ata — {konut.daireNo}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div>
          <label className="text-xs text-gray-500">Daire Sahibi</label>
          <select value={secilen} onChange={e => setSecilen(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
            <option value="">— Sahip yok —</option>
            {sahipler.map(s => <option key={s.id} value={s.id}>{s.ad} {s.soyad}</option>)}
          </select>
          {sahipler.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Kayıtlı sahip yok.{" "}
              <a href="/daire-sahipleri" className="text-emerald-600 underline">Ekle</a>
            </p>
          )}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={save} disabled={saving}
            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60">
            {saving ? "..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Blok Grubu ───────────────────────────────────────────────────────────────
function BlokGrubu({ blok, daireler, onRefresh }: {
  blok: string; daireler: Konut[]; onRefresh: () => void;
}) {
  const router = useRouter();
  const [acik, setAcik]           = useState(false);
  const [editKonut, setEditKonut] = useState<Konut | null>(null);
  const [sozKonut, setSozKonut]   = useState<Konut | null>(null);
  const [sahKonut, setSahKonut]   = useState<Konut | null>(null);

  const fmt = (n: number) =>
    n > 0 ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n) : "—";

  const doluSayisi = daireler.filter(d => d.durum === "Dolu").length;
  const ozelTipler = [...new Set(daireler.map(d => d.tip))].join("/");
  const ozelM2    = [...new Set(daireler.map(d => d.metrekare))].join("/");

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setAcik(a => !a)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">
            {blok}
          </span>
          <div className="text-left">
            <p className="font-semibold text-gray-800 text-sm">{blok} Blok</p>
            <p className="text-xs text-gray-400">
              {daireler.length} daire • {doluSayisi} dolu • {daireler.length - doluSayisi} boş
              {` • ${ozelTipler} / ${ozelM2} m²`}
            </p>
          </div>
        </div>
        {acik ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {acik && (
        <div className="overflow-x-auto border-t border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left">No</th>
                <th className="px-4 py-2 text-left">Kat</th>
                <th className="px-4 py-2 text-left">Tip</th>
                <th className="px-4 py-2 text-left">m²</th>
                <th className="px-4 py-2 text-left">Kira</th>
                <th className="px-4 py-2 text-left">Kiracı</th>
                <th className="px-4 py-2 text-left">Durum</th>
                <th className="px-4 py-2 text-left">Sahip</th>
                <th className="px-4 py-2 text-left">Özellikler</th>
                <th className="px-4 py-2 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {daireler.map(k => {
                const ozellikler = parseOzellikler(k.ozellikler);
                const aktifSoz   = k.sozlesmeler?.find(s => s.durum === "Aktif");
                const kiraci     = aktifSoz?.ogrenci;
                return (
                  <tr key={k.id} className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/konutlar/${k.id}`)}>
                    <td className="px-4 py-2.5 font-medium text-gray-700">{k.daireNo}</td>
                    <td className="px-4 py-2.5 text-gray-500">{k.katNo}</td>
                    <td className="px-4 py-2.5 text-gray-500">{k.tip}</td>
                    <td className="px-4 py-2.5 text-gray-500">{k.metrekare}</td>
                    <td className="px-4 py-2.5 text-gray-700">{fmt(aktifSoz?.aylikKira ?? k.kiraBedeli)}</td>
                    <td className="px-4 py-2.5">
                      {kiraci ? (
                        <div>
                          <p className="text-sm font-medium text-gray-800">{kiraci.ad} {kiraci.soyad}</p>
                          {kiraci.telefon && kiraci.telefon !== "-" && (
                            <p className="text-xs text-gray-400">{kiraci.telefon}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DURUM_RENK[k.durum] ?? "bg-gray-100 text-gray-600"}`}>
                        {DURUM_LABEL[k.durum] ?? k.durum}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">
                      {k.daireSahibi ? `${k.daireSahibi.ad} ${k.daireSahibi.soyad}` : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {ozellikler.slice(0, 3).map(o => (
                          <span key={o} className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">{o}</span>
                        ))}
                        {ozellikler.length > 3 && (
                          <span className="text-xs text-gray-400">+{ozellikler.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditKonut(k)} title="Düzenle"
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setSozKonut(k)} title="Sözleşme Ekle"
                          disabled={k.durum === "Dolu"}
                          className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                          <FileText size={13} />
                        </button>
                        <button onClick={() => setSahKonut(k)} title="Sahip Ata"
                          className="p-1.5 rounded hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors">
                          <UserCheck size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editKonut && (
        <EditModal
          konut={editKonut}
          onClose={() => setEditKonut(null)}
          onSaved={onRefresh}
          onSozlesmeAc={() => setSozKonut(editKonut)}
          onSahibiAc={() => setSahKonut(editKonut)}
        />
      )}
      {sozKonut && <SozlesmeModal konut={sozKonut} onClose={() => setSozKonut(null)} onSaved={onRefresh} />}
      {sahKonut && <SahibiModal  konut={sahKonut} onClose={() => setSahKonut(null)} onSaved={onRefresh} />}
    </div>
  );
}

// ─── Etap 2: Daire Kartı ──────────────────────────────────────────────────────
function Etap2DaireKart({ konut, onEdit, onSozlesme, onSahip }: {
  konut: Konut;
  onEdit: () => void;
  onSozlesme: (oda: string) => void;
  onSahip: () => void;
}) {
  const dairePart = konut.daireNo.split("-").pop() ?? konut.daireNo;
  const oda1 = konut.sozlesmeler?.find(s => s.oda === "Oda 1");
  const oda2 = konut.sozlesmeler?.find(s => s.oda === "Oda 2");
  const fmt  = (n: number) =>
    n > 0 ? new Intl.NumberFormat("tr-TR").format(n) + " ₺" : "—";

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-sm text-gray-800">{dairePart}</span>
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={onEdit} title="Düzenle"
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <Pencil size={12} />
          </button>
          <button onClick={onSahip} title="Sahip Ata"
            className="p-1 rounded hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors">
            <UserCheck size={12} />
          </button>
        </div>
      </div>

      {konut.daireSahibi && (
        <p className="text-xs text-gray-400 mb-2 truncate">
          {konut.daireSahibi.ad} {konut.daireSahibi.soyad}
        </p>
      )}

      <div className="space-y-1">
        {([{ label: "Oda 1", soz: oda1 }, { label: "Oda 2", soz: oda2 }] as const).map(({ label, soz }) => (
          <div key={label} className="flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1.5 gap-1">
            <span className={`text-xs font-semibold w-10 shrink-0 ${label === "Oda 1" ? "text-indigo-600" : "text-purple-600"}`}>{label}</span>
            <div className="flex-1 min-w-0">
              {soz?.ogrenci ? (
                <>
                  <p className="text-xs text-gray-800 font-medium truncate">{soz.ogrenci.ad} {soz.ogrenci.soyad}</p>
                  {soz.ogrenci.telefon && soz.ogrenci.telefon !== "-" && (
                    <p className="text-xs text-gray-400 truncate">{soz.ogrenci.telefon}</p>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-300">Boş</span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {soz ? (
                <>
                  <span className="text-xs text-gray-600 font-medium">{fmt(soz.aylikKira)}</span>
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">Dolu</span>
                </>
              ) : (
                <>
                  {konut.kiraBedeli > 0 && (
                    <span className="text-xs text-gray-400">{fmt(konut.kiraBedeli)}</span>
                  )}
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Boş</span>
                  <button onClick={() => onSozlesme(label)} title="Sözleşme Ekle"
                    className="p-0.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                    <FileText size={11} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Toplam kira */}
      {(oda1 || oda2) && (
        <p className="text-xs text-gray-500 mt-2 text-right font-medium">
          Toplam: {fmt((oda1?.aylikKira ?? 0) + (oda2?.aylikKira ?? 0))}
        </p>
      )}
    </div>
  );
}

// ─── Etap 2: Blok içi liste tablosu ──────────────────────────────────────────
function BlokListeTablosu({ daireler, onEdit, onSozlesme, onSahip }: {
  daireler: Konut[];
  onEdit: (k: Konut) => void;
  onSozlesme: (k: Konut, oda: string) => void;
  onSahip: (k: Konut) => void;
}) {
  const fmt = (n: number) => n > 0 ? new Intl.NumberFormat("tr-TR").format(n) + " ₺" : "—";
  const sorted = [...daireler].sort((a, z) => {
    const parse = (d: string) => { const p = d.split("-").pop() ?? d; return { num: parseInt(p, 10) || 0, ltr: p.replace(/\d+/, "") }; };
    const av = parse(a.daireNo), zv = parse(z.daireNo);
    return av.num !== zv.num ? av.num - zv.num : av.ltr.localeCompare(zv.ltr);
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            <th className="px-3 py-2 text-left">Daire</th>
            <th className="px-3 py-2 text-left">Oda</th>
            <th className="px-3 py-2 text-left">Kiracı</th>
            <th className="px-3 py-2 text-left">Kira</th>
            <th className="px-3 py-2 text-left">Durum</th>
            <th className="px-3 py-2 text-right">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(k => {
            const dairePart = k.daireNo.split("-").pop() ?? k.daireNo;
            const oda1 = k.sozlesmeler?.find(s => s.oda === "Oda 1");
            const oda2 = k.sozlesmeler?.find(s => s.oda === "Oda 2");
            const toplamKira = (oda1?.aylikKira ?? 0) + (oda2?.aylikKira ?? 0);
            const odaRows = [{ label: "Oda 1", soz: oda1 }, { label: "Oda 2", soz: oda2 }] as const;
            return (
              <Fragment key={k.id}>
                {odaRows.map(({ label, soz }, idx) => (
                  <tr key={label} className={`hover:bg-gray-50/50 ${idx === 0 ? "border-t-2 border-gray-200" : "border-t border-dashed border-gray-100"}`}>
                    {idx === 0 && (
                      <td rowSpan={2} className="px-3 py-2 align-middle">
                        <div className="font-bold text-gray-800">{dairePart}</div>
                        {toplamKira > 0 && <div className="text-xs text-gray-400">Toplam: {fmt(toplamKira)}</div>}
                      </td>
                    )}
                    <td className="px-3 py-2">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${label === "Oda 1" ? "bg-indigo-50 text-indigo-700" : "bg-purple-50 text-purple-700"}`}>{label}</span>
                    </td>
                    <td className="px-3 py-2">
                      {soz?.ogrenci ? (
                        <div>
                          <p className="text-sm font-medium text-gray-800 truncate max-w-[160px]">{soz.ogrenci.ad} {soz.ogrenci.soyad}</p>
                          {soz.ogrenci.telefon && soz.ogrenci.telefon !== "-" && <p className="text-xs text-gray-400">{soz.ogrenci.telefon}</p>}
                        </div>
                      ) : <span className="text-xs text-gray-300 italic">Boş</span>}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {soz ? <span className="font-medium text-gray-800">{fmt(soz.aylikKira)}</span>
                           : k.kiraBedeli > 0 ? <span className="text-gray-400 text-xs">{fmt(k.kiraBedeli)} <span className="text-gray-300">(liste)</span></span>
                           : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2">
                      {soz ? <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Dolu</span>
                           : <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Boş</span>}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!soz && <button onClick={() => onSozlesme(k, label)} title="Sözleşme Ekle" className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"><FileText size={12} /></button>}
                        {idx === 1 && <>
                          <button onClick={() => onEdit(k)} title="Düzenle" className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Pencil size={12} /></button>
                          <button onClick={() => onSahip(k)} title="Sahip Ata" className="p-1 rounded hover:bg-emerald-50 text-gray-400 hover:text-emerald-600"><UserCheck size={12} /></button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Etap 2: Alt Blok (A1 / A2 / A3 veya B / C / …) ─────────────────────────
function Etap2AltBlok({ blok, daireler, onRefresh }: {
  blok: string; daireler: Konut[]; onRefresh: () => void;
}) {
  const [acik, setAcik]           = useState(false);
  const [gorunum, setGorunum]     = useState<"kart" | "liste">("kart");
  const [editKonut, setEditKonut] = useState<Konut | null>(null);
  const [sozKonut,  setSozKonut]  = useState<Konut | null>(null);
  const [sozOda,    setSozOda]    = useState<string | undefined>(undefined);
  const [sahKonut,  setSahKonut]  = useState<Konut | null>(null);

  const doluSayisi = daireler.filter(d => d.durum === "Dolu").length;
  const bosSayisi  = daireler.length - doluSayisi;

  const sortedDaireler = [...daireler].sort((a, z) => {
    const parse = (daireNo: string) => {
      const part = daireNo.split("-").pop() ?? daireNo;
      return { num: parseInt(part, 10) || 0, ltr: part.replace(/\d+/, "") };
    };
    const av = parse(a.daireNo), zv = parse(z.daireNo);
    return av.num !== zv.num ? av.num - zv.num : av.ltr.localeCompare(zv.ltr);
  });

  const openSozlesme = (konut: Konut, oda: string) => { setSozKonut(konut); setSozOda(oda); };

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-center px-4 py-3 bg-gray-50">
        <button onClick={() => setAcik(a => !a)} className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{blok}</span>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{blok} Blok</p>
            <p className="text-xs text-gray-400">{daireler.length} daire • {doluSayisi} dolu • {bosSayisi} boş</p>
          </div>
        </button>
        {acik && (
          <div className="flex items-center gap-1 mr-2">
            <button onClick={() => setGorunum("kart")} title="Kart" className={`p-1.5 rounded transition-colors ${gorunum === "kart" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-200"}`}><LayoutGrid size={13} /></button>
            <button onClick={() => setGorunum("liste")} title="Liste" className={`p-1.5 rounded transition-colors ${gorunum === "liste" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-200"}`}><List size={13} /></button>
          </div>
        )}
        <button onClick={() => setAcik(a => !a)}>
          {acik ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </button>
      </div>

      {acik && (
        gorunum === "kart" ? (
          <div className="p-3 bg-white grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {sortedDaireler.map(k => (
              <Etap2DaireKart key={k.id} konut={k} onEdit={() => setEditKonut(k)} onSozlesme={oda => openSozlesme(k, oda)} onSahip={() => setSahKonut(k)} />
            ))}
          </div>
        ) : (
          <div className="bg-white">
            <BlokListeTablosu daireler={sortedDaireler} onEdit={setEditKonut} onSozlesme={openSozlesme} onSahip={setSahKonut} />
          </div>
        )
      )}

      {editKonut && (
        <EditModal
          konut={editKonut}
          onClose={() => setEditKonut(null)}
          onSaved={onRefresh}
          onSozlesmeAc={() => { setSozKonut(editKonut); setSozOda(undefined); }}
          onSahibiAc={() => setSahKonut(editKonut)}
        />
      )}
      {sozKonut && (
        <SozlesmeModal
          konut={sozKonut}
          oda={sozOda}
          onClose={() => { setSozKonut(null); setSozOda(undefined); }}
          onSaved={onRefresh}
        />
      )}
      {sahKonut && <SahibiModal konut={sahKonut} onClose={() => setSahKonut(null)} onSaved={onRefresh} />}
    </div>
  );
}

// ─── Etap 2: Daire Kart Sarmalayıcı (modal state'ini yönetir) ────────────────
function _Etap2DaireKartWrapper({ konut, onRefresh }: { konut: Konut; onRefresh: () => void }) {
  const router = useRouter();
  const [editOpen,  setEditOpen]  = useState(false);
  const [sozOpen,   setSozOpen]   = useState(false);
  const [sozOda,    setSozOda]    = useState<string | undefined>(undefined);
  const [sahOpen,   setSahOpen]   = useState(false);

  const openSoz = (oda?: string) => { setSozOda(oda); setSozOpen(true); };

  return (
    <div onClick={() => router.push(`/konutlar/${konut.id}`)} className="cursor-pointer">
      <Etap2DaireKart
        konut={konut}
        onEdit={() => setEditOpen(true)}
        onSozlesme={oda => openSoz(oda)}
        onSahip={() => setSahOpen(true)}
      />
      {editOpen && (
        <EditModal
          konut={konut}
          onClose={() => setEditOpen(false)}
          onSaved={onRefresh}
          onSozlesmeAc={() => { setEditOpen(false); openSoz(undefined); }}
          onSahibiAc={() => { setEditOpen(false); setSahOpen(true); }}
        />
      )}
      {sozOpen && (
        <SozlesmeModal konut={konut} oda={sozOda} onClose={() => setSozOpen(false)} onSaved={onRefresh} />
      )}
      {sahOpen && <SahibiModal konut={konut} onClose={() => setSahOpen(false)} onSaved={onRefresh} />}
    </div>
  );
}

// ─── Etap 2: Üst Blok (A grubu için alt blokları içerir) ─────────────────────
function Etap2BlokGrubu({ parentBlok, konutlar, onRefresh }: {
  parentBlok: string; konutlar: Konut[]; onRefresh: () => void;
}) {
  const [acik,    setAcik]    = useState(false);
  const [gorunum, setGorunum] = useState<"kart" | "liste">("kart");

  // Non-A blocks: modal state
  const [editKonut, setEditKonut] = useState<Konut | null>(null);
  const [sozKonut,  setSozKonut]  = useState<Konut | null>(null);
  const [sozOda,    setSozOda]    = useState<string | undefined>(undefined);
  const [sahKonut,  setSahKonut]  = useState<Konut | null>(null);

  const isAGrubu = parentBlok === "A";

  const altBloklar = [...new Set(konutlar.map(k => k.blok))].sort();
  const altBlokMap = altBloklar.reduce<Record<string, Konut[]>>((acc, b) => {
    acc[b] = konutlar.filter(k => k.blok === b);
    return acc;
  }, {});

  const doluSayisi = konutlar.filter(k => k.durum === "Dolu").length;

  const sortedKonutlar = [...konutlar].sort((a, z) => {
    const parse = (d: string) => { const p = d.split("-").pop() ?? d; return { num: parseInt(p, 10) || 0, ltr: p.replace(/\d+/, "") }; };
    const av = parse(a.daireNo), zv = parse(z.daireNo);
    return av.num !== zv.num ? av.num - zv.num : av.ltr.localeCompare(zv.ltr);
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center px-5 py-3.5">
        <button onClick={() => setAcik(a => !a)} className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">{parentBlok}</span>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{parentBlok} Blok</p>
            <p className="text-xs text-gray-400">
              {isAGrubu ? `${altBloklar.length} alt blok • ` : ""}
              {konutlar.length} daire • {doluSayisi} dolu • {konutlar.length - doluSayisi} boş
            </p>
          </div>
        </button>
        {acik && !isAGrubu && (
          <div className="flex items-center gap-1 mr-2">
            <button onClick={() => setGorunum("kart")} title="Kart Görünümü" className={`p-1.5 rounded transition-colors ${gorunum === "kart" ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-100"}`}><LayoutGrid size={14} /></button>
            <button onClick={() => setGorunum("liste")} title="Liste Görünümü" className={`p-1.5 rounded transition-colors ${gorunum === "liste" ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-100"}`}><List size={14} /></button>
          </div>
        )}
        <button onClick={() => setAcik(a => !a)}>
          {acik ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
      </div>

      {acik && (
        <div className="border-t border-gray-100">
          {isAGrubu ? (
            <div className="p-3 space-y-2">
              {altBloklar.map(ab => (
                <Etap2AltBlok key={ab} blok={ab} daireler={altBlokMap[ab]} onRefresh={onRefresh} />
              ))}
            </div>
          ) : gorunum === "kart" ? (
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {sortedKonutlar.map(k => (
                <_Etap2DaireKartWrapper key={k.id} konut={k} onRefresh={onRefresh} />
              ))}
            </div>
          ) : (
            <BlokListeTablosu
              daireler={sortedKonutlar}
              onEdit={setEditKonut}
              onSozlesme={(k, oda) => { setSozKonut(k); setSozOda(oda); }}
              onSahip={setSahKonut}
            />
          )}
        </div>
      )}

      {editKonut && <EditModal konut={editKonut} onClose={() => setEditKonut(null)} onSaved={onRefresh} onSozlesmeAc={() => { setSozKonut(editKonut); setSozOda(undefined); }} onSahibiAc={() => setSahKonut(editKonut)} />}
      {sozKonut  && <SozlesmeModal konut={sozKonut} oda={sozOda} onClose={() => { setSozKonut(null); setSozOda(undefined); }} onSaved={onRefresh} />}
      {sahKonut  && <SahibiModal konut={sahKonut} onClose={() => setSahKonut(null)} onSaved={onRefresh} />}
    </div>
  );
}

// ─── Etap 2: Liste Görünümü (her oda ayrı satır) ─────────────────────────────
function Etap2ListeGorunum({ konutlar, onRefresh }: { konutlar: Konut[]; onRefresh: () => void }) {
  const [editKonut, setEditKonut] = useState<Konut | null>(null);
  const [sozKonut,  setSozKonut]  = useState<Konut | null>(null);
  const [sozOda,    setSozOda]    = useState<string | undefined>(undefined);
  const [sahKonut,  setSahKonut]  = useState<Konut | null>(null);

  const fmt = (n: number) =>
    n > 0 ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n) : "—";

  const sorted = sortDaireler(konutlar);

  // Toplam kira hesabı (oda başına)
  const toplamKira = (k: Konut) => {
    const aktif = k.sozlesmeler?.filter(s => s.durum === "Aktif") ?? [];
    return aktif.reduce((sum, s) => sum + s.aylikKira, 0);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2.5 text-left border-b border-gray-100">Blok</th>
              <th className="px-4 py-2.5 text-left border-b border-gray-100">Daire</th>
              <th className="px-4 py-2.5 text-left border-b border-gray-100">Kat</th>
              <th className="px-4 py-2.5 text-left border-b border-gray-100">Oda</th>
              <th className="px-4 py-2.5 text-left border-b border-gray-100">Kiracı</th>
              <th className="px-4 py-2.5 text-left border-b border-gray-100">Kira</th>
              <th className="px-4 py-2.5 text-left border-b border-gray-100">Sahip</th>
              <th className="px-4 py-2.5 text-left border-b border-gray-100">Durum</th>
              <th className="px-4 py-2.5 text-right border-b border-gray-100">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(k => {
              const dairePart  = k.daireNo.split("-").pop() ?? k.daireNo;
              const oda1       = k.sozlesmeler?.find(s => s.oda === "Oda 1");
              const oda2       = k.sozlesmeler?.find(s => s.oda === "Oda 2");
              const doluCount  = [oda1, oda2].filter(Boolean).length;
              const totalKira  = toplamKira(k);

              const odaRows = [
                { label: "Oda 1", soz: oda1 },
                { label: "Oda 2", soz: oda2 },
              ] as const;

              return (
                <Fragment key={k.id}>
                  {odaRows.map(({ label, soz }, idx) => (
                    <tr key={label}
                      className={`transition-colors hover:bg-blue-50/30 ${
                        idx === 0
                          ? "border-t-2 border-gray-200"
                          : "border-t border-dashed border-gray-100"
                      }`}>

                      {/* Blok — sadece Oda 1 satırında, 2 satırı kapsıyor */}
                      {idx === 0 && (
                        <td rowSpan={2} className="px-4 py-2 align-middle">
                          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            {k.blok}
                          </span>
                        </td>
                      )}

                      {/* Daire No — sadece Oda 1 satırında */}
                      {idx === 0 && (
                        <td rowSpan={2} className="px-4 py-2 align-middle">
                          <div className="font-bold text-gray-800">{dairePart}</div>
                          {totalKira > 0 && (
                            <div className="text-xs text-gray-400 mt-0.5">Toplam: {fmt(totalKira)}</div>
                          )}
                        </td>
                      )}

                      {/* Kat — sadece Oda 1 satırında */}
                      {idx === 0 && (
                        <td rowSpan={2} className="px-4 py-2 align-middle text-gray-500">{k.katNo}</td>
                      )}

                      {/* Oda etiketi */}
                      <td className="px-3 py-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                          label === "Oda 1"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-purple-50 text-purple-700"
                        }`}>
                          {label}
                        </span>
                      </td>

                      {/* Kiracı */}
                      <td className="px-4 py-2">
                        {soz?.ogrenci ? (
                          <div>
                            <p className="text-sm font-medium text-gray-800">{soz.ogrenci.ad} {soz.ogrenci.soyad}</p>
                            {soz.ogrenci.telefon && soz.ogrenci.telefon !== "-" && (
                              <p className="text-xs text-gray-400">{soz.ogrenci.telefon}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs italic">Boş</span>
                        )}
                      </td>

                      {/* Kira — sozleşmedeki kira, yoksa konutun kiraBedeli (tahmini) */}
                      <td className="px-4 py-2">
                        {soz
                          ? <span className="text-gray-800 font-medium">{fmt(soz.aylikKira)}</span>
                          : k.kiraBedeli > 0
                            ? <span className="text-gray-400 text-xs">{fmt(k.kiraBedeli)} <span className="text-gray-300">(liste)</span></span>
                            : <span className="text-gray-300 text-xs">—</span>}
                      </td>

                      {/* Sahip — sadece Oda 1 satırında */}
                      {idx === 0 && (
                        <td rowSpan={2} className="px-4 py-2 align-middle text-xs text-gray-500">
                          {k.daireSahibi
                            ? `${k.daireSahibi.ad} ${k.daireSahibi.soyad}`
                            : <span className="text-gray-300">—</span>}
                        </td>
                      )}

                      {/* Durum */}
                      <td className="px-4 py-2">
                        {soz
                          ? <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Dolu</span>
                          : <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Boş</span>}
                      </td>

                      {/* İşlemler */}
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!soz && (
                            <button
                              onClick={() => { setSozKonut(k); setSozOda(label); }}
                              title={`${label} Sözleşme Ekle`}
                              className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                              <FileText size={13} />
                            </button>
                          )}
                          {/* Daire düzenle + sahip ata — sadece Oda 2 satırında (altta görünsün) */}
                          {idx === 1 && (
                            <>
                              <button onClick={() => setEditKonut(k)} title="Daireyi Düzenle"
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                                <Pencil size={13} />
                              </button>
                              <button onClick={() => setSahKonut(k)} title="Sahip Ata"
                                className="p-1.5 rounded hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors">
                                <UserCheck size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Toplam satırı — her iki oda doluysa ve kiralar farklıysa */}
                  {doluCount === 2 && oda1 && oda2 && oda1.aylikKira !== oda2.aylikKira && (
                    <tr className="bg-gray-50/60">
                      <td colSpan={3} />
                      <td colSpan={2} className="px-4 py-1 text-xs text-gray-500">Toplam aylık kira</td>
                      <td className="px-4 py-1 text-xs font-semibold text-gray-700">{fmt(oda1.aylikKira + oda2.aylikKira)}</td>
                      <td colSpan={3} />
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">Sonuç bulunamadı</div>
        )}
      </div>

      {editKonut && (
        <EditModal konut={editKonut} onClose={() => setEditKonut(null)} onSaved={onRefresh}
          onSozlesmeAc={() => { setSozKonut(editKonut); setSozOda(undefined); }}
          onSahibiAc={() => setSahKonut(editKonut)} />
      )}
      {sozKonut && (
        <SozlesmeModal konut={sozKonut} oda={sozOda}
          onClose={() => { setSozKonut(null); setSozOda(undefined); }} onSaved={onRefresh} />
      )}
      {sahKonut && <SahibiModal konut={sahKonut} onClose={() => setSahKonut(null)} onSaved={onRefresh} />}
    </div>
  );
}

// ─── Etap 1 & 3: Tek Oda Daire Kartı ────────────────────────────────────────
function EtapDaireKart({ konut, onEdit, onSozlesme, onSahip }: {
  konut: Konut; onEdit: () => void; onSozlesme: () => void; onSahip: () => void;
}) {
  const aktifSoz = konut.sozlesmeler?.find(s => s.durum === "Aktif");
  const kiraci   = aktifSoz?.ogrenci;
  const fmt = (n: number) => n > 0 ? new Intl.NumberFormat("tr-TR").format(n) + " ₺" : "—";

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <span className="font-bold text-sm text-gray-800">{konut.daireNo}</span>
          <span className="text-xs text-gray-400 ml-1.5">Kat {konut.katNo}</span>
        </div>
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={onEdit}     title="Düzenle"   className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Pencil   size={12} /></button>
          <button onClick={onSahip}    title="Sahip Ata" className="p-1 rounded hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"><UserCheck size={12} /></button>
        </div>
      </div>

      {konut.daireSahibi && (
        <p className="text-xs text-gray-400 mb-1.5 truncate">{konut.daireSahibi.ad} {konut.daireSahibi.soyad}</p>
      )}

      <div className={`rounded-lg px-2.5 py-2 mb-1.5 ${konut.durum === "Dolu" ? "bg-red-50" : konut.durum === "Bakimda" ? "bg-yellow-50" : "bg-green-50"}`}>
        {kiraci ? (
          <div>
            <p className="text-xs font-semibold text-gray-800 truncate">{kiraci.ad} {kiraci.soyad}</p>
            {kiraci.telefon && kiraci.telefon !== "-" && <p className="text-xs text-gray-400 truncate">{kiraci.telefon}</p>}
            <p className="text-xs font-semibold text-emerald-700 mt-0.5">{fmt(aktifSoz!.aylikKira)}</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{konut.durum === "Bakimda" ? "Bakımda" : "Boş"}</span>
            <div className="flex items-center gap-1">
              {konut.kiraBedeli > 0 && <span className="text-xs text-gray-400">{fmt(konut.kiraBedeli)}</span>}
              {konut.durum !== "Bakimda" && (
                <button onClick={onSozlesme} title="Sözleşme Ekle"
                  className="p-0.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                  <FileText size={11} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${DURUM_RENK[konut.durum] ?? "bg-gray-100 text-gray-500"}`}>
          {DURUM_LABEL[konut.durum] ?? konut.durum}
        </span>
        <span className="text-xs text-gray-400">{konut.tip}</span>
      </div>
    </div>
  );
}

function EtapDaireKartWrapper({ konut, onRefresh }: { konut: Konut; onRefresh: () => void }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [sozOpen,  setSozOpen]  = useState(false);
  const [sahOpen,  setSahOpen]  = useState(false);
  return (
    <div onClick={() => router.push(`/konutlar/${konut.id}`)} className="cursor-pointer">
      <EtapDaireKart konut={konut} onEdit={() => setEditOpen(true)} onSozlesme={() => setSozOpen(true)} onSahip={() => setSahOpen(true)} />
      {editOpen && <EditModal konut={konut} onClose={() => setEditOpen(false)} onSaved={onRefresh}
        onSozlesmeAc={() => { setEditOpen(false); setSozOpen(true); }}
        onSahibiAc={() => { setEditOpen(false); setSahOpen(true); }} />}
      {sozOpen && <SozlesmeModal konut={konut} onClose={() => setSozOpen(false)} onSaved={onRefresh} />}
      {sahOpen && <SahibiModal   konut={konut} onClose={() => setSahOpen(false)} onSaved={onRefresh} />}
    </div>
  );
}

function EtapKartBlokGrubu({ blok, daireler, onRefresh }: { blok: string; daireler: Konut[]; onRefresh: () => void }) {
  const [acik, setAcik] = useState(false);
  const doluSayisi = daireler.filter(d => d.durum === "Dolu").length;
  const sorted = [...daireler].sort((a, z) => {
    const n = (d: string) => parseInt(d.replace(/\D+/g, ""), 10) || 0;
    return n(a.daireNo) - n(z.daireNo);
  });
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setAcik(a => !a)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:opacity-80 transition-opacity text-left">
        <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">{blok}</span>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{blok} Blok</p>
          <p className="text-xs text-gray-400">{daireler.length} daire · {doluSayisi} dolu · {daireler.length - doluSayisi} boş</p>
        </div>
        <div className="ml-auto">
          {acik ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </button>
      {acik && (
        <div className="p-3 bg-white grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {sorted.map(k => <EtapDaireKartWrapper key={k.id} konut={k} onRefresh={onRefresh} />)}
        </div>
      )}
    </div>
  );
}

// ─── Excel Yardımcıları ───────────────────────────────────────────────────────
function exportExcel(konutlar: Konut[]) {
  const rows = konutlar.map(k => ({
    "Blok":         k.blok,
    "Daire No":     k.daireNo,
    "Kat":          k.katNo,
    "Tip":          k.tip,
    "m²":           k.metrekare,
    "Kira (₺)":     k.kiraBedeli,
    "Durum":        DURUM_LABEL[k.durum] ?? k.durum,
    "Etap":         k.etap,
    "Daire Sahibi": k.daireSahibi ? `${k.daireSahibi.ad} ${k.daireSahibi.soyad}` : "",
    "Özellikler":   parseOzellikler(k.ozellikler).join(", "),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [8, 12, 6, 8, 6, 12, 10, 6, 20, 30].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Konutlar");
  XLSX.writeFile(wb, `UNIGARDEN_Konutlar_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

async function importExcel(
  file: File,
  baseUrl: string,
  onProgress: (msg: string) => void,
): Promise<{ eklendi: number; guncellendi: number; hata: number }> {
  const buf  = await file.arrayBuffer();
  const wb   = XLSX.read(buf);
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws);

  let eklendi = 0, guncellendi = 0, hata = 0;

  // Mevcut konutları çek (daireNo → id eşleşmesi için)
  const mevcut: Konut[] = await fetch(`${baseUrl}/api/konutlar`).then(r => r.json());
  const mevcutMap = new Map(mevcut.map(k => [k.daireNo, k.id]));

  for (const row of rows) {
    const daireNo = String(row["Daire No"] ?? "").trim();
    if (!daireNo) continue;

    const payload = {
      blok:       String(row["Blok"] ?? "").trim(),
      daireNo,
      katNo:      Number(row["Kat"] ?? 1),
      tip:        String(row["Tip"] ?? "1+1").trim(),
      metrekare:  Number(row["m²"] ?? 0),
      kiraBedeli: Number(row["Kira (₺)"] ?? 0),
      durum:      durumKod(String(row["Durum"] ?? "Boş")),
      etap:       Number(row["Etap"] ?? 1),
      ozellikler: serializeOzellikler(
        String(row["Özellikler"] ?? "").split(",").map(s => s.trim()).filter(Boolean)
      ),
    };

    try {
      const existingId = mevcutMap.get(daireNo);
      if (existingId) {
        await fetch(`${baseUrl}/api/konutlar/${existingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        guncellendi++;
      } else {
        await fetch(`${baseUrl}/api/konutlar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        eklendi++;
      }
      onProgress(`${eklendi + guncellendi} / ${rows.length} işlendi...`);
    } catch {
      hata++;
    }
  }

  return { eklendi, guncellendi, hata };
}

function durumKod(label: string): string {
  if (label === "Dolu")    return "Dolu";
  if (label === "Bakımda") return "Bakimda";
  return "Bos";
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function KonutlarPage() {
  const [konutlar,     setKonutlar]     = useState<Konut[]>([]);
  const [aktifEtap,    setAktifEtap]    = useState<number | "tumu">(1);
  const [yeniModal,    setYeniModal]    = useState(false);
  const [importMsg,    setImportMsg]    = useState("");
  const [importing,    setImporting]    = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Etap 2 filtre & görünüm state'leri
  const [aramaMetni,   setAramaMetni]   = useState("");
  const [durumFiltre2, setDurumFiltre2] = useState<"tumu" | "dolu" | "karma" | "bos">("tumu");
  const [blokFiltre2,  setBlokFiltre2]  = useState("");
  const [gorunum2,     setGorunum2]     = useState<"kart" | "liste">("kart");

  // Etap 1 & 3 filtre & görünüm state'leri
  const [aramaMetni13,  setAramaMetni13]  = useState("");
  const [durumFiltre13, setDurumFiltre13] = useState<"tumu" | "dolu" | "bos" | "bakimda">("tumu");
  const [blokFiltre13,  setBlokFiltre13]  = useState("");
  const [gorunum13,     setGorunum13]     = useState<"kart" | "liste">("kart");

  const [yeniForm, setYeniForm] = useState({
    blok: "", katNo: "1", daireNo: "", tip: "1+1",
    metrekare: "48", kiraBedeli: "0", durum: "Bos", etap: "1",
  });

  const load = useCallback(() =>
    fetch("/api/konutlar").then(r => r.json()).then(setKonutlar), []);

  useEffect(() => { load(); }, [load]);

  const ekle = async () => {
    await fetch("/api/konutlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...yeniForm, katNo: Number(yeniForm.katNo),
        metrekare: Number(yeniForm.metrekare),
        kiraBedeli: Number(yeniForm.kiraBedeli),
        etap: Number(yeniForm.etap),
      }),
    });
    setYeniModal(false);
    setYeniForm({ blok: "", katNo: "1", daireNo: "", tip: "1+1", metrekare: "48", kiraBedeli: "0", durum: "Bos", etap: "1" });
    load();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg("İçe aktarılıyor...");
    const { eklendi, guncellendi, hata } = await importExcel(file, "", setImportMsg);
    setImportMsg(`Tamamlandı: ${eklendi} yeni, ${guncellendi} güncellendi${hata ? `, ${hata} hata` : ""}`);
    setImporting(false);
    load();
    e.target.value = "";
    setTimeout(() => setImportMsg(""), 5000);
  };

  const filtreli    = aktifEtap === "tumu" ? konutlar : konutlar.filter(k => k.etap === aktifEtap);

  // ── Etap 1 & 3 ortak filtre fonksiyonu ──────────────────────────────────────
  const filtrele13 = (k: Konut, etapNo: number): boolean => {
    if (aktifEtap !== etapNo) return true; // "Tümü" sekmesinde filtre yok
    if (blokFiltre13 && k.blok !== blokFiltre13) return false;
    if (durumFiltre13 !== "tumu") {
      if (durumFiltre13 === "dolu"    && k.durum !== "Dolu")    return false;
      if (durumFiltre13 === "bos"     && k.durum !== "Bos")     return false;
      if (durumFiltre13 === "bakimda" && k.durum !== "Bakimda") return false;
    }
    if (aramaMetni13) {
      const q      = aramaMetni13.toLowerCase();
      const kiraci = k.sozlesmeler?.find(s => s.durum === "Aktif")?.ogrenci;
      const sahip  = k.daireSahibi ? `${k.daireSahibi.ad} ${k.daireSahibi.soyad}`.toLowerCase() : "";
      const kAd    = kiraci ? `${kiraci.ad} ${kiraci.soyad}`.toLowerCase() : "";
      if (!k.daireNo.toLowerCase().includes(q) && !k.blok.toLowerCase().includes(q)
          && !sahip.includes(q) && !kAd.includes(q)) return false;
    }
    return true;
  };

  // Etap 1
  const etap1Ham       = konutlar.filter(k => k.etap === 1);
  const etap1Bloklar   = [...new Set(etap1Ham.map(k => k.blok))].sort();
  const etap1Filtreli  = etap1Ham.filter(k => filtrele13(k, 1));
  const etap1GruplariF = etap1Bloklar.reduce<Record<string, Konut[]>>((acc, b) => {
    acc[b] = etap1Filtreli.filter(k => k.blok === b).sort((a, z) => {
      const n = (d: string) => parseInt(d.replace(/\D+/g, ""), 10) || 0;
      return n(a.daireNo) - n(z.daireNo);
    });
    return acc;
  }, {});

  // Etap 2 — önce etap filtresi, sonra arama/blok/durum filtreleri
  const etap2Ham = filtreli.filter(k => k.etap === 2);
  const etap2Parents = [...new Set(etap2Ham.map(k => getParentBlok(k.blok)))].sort();

  const etap2Filtreli = etap2Ham.filter(k => {
    if (blokFiltre2 && getParentBlok(k.blok) !== blokFiltre2) return false;
    if (durumFiltre2 !== "tumu") {
      const aktif = k.sozlesmeler?.filter(s => s.durum === "Aktif").length ?? 0;
      if (durumFiltre2 === "dolu"  && aktif < 2)  return false;
      if (durumFiltre2 === "bos"   && aktif > 0)  return false;
      if (durumFiltre2 === "karma" && aktif !== 1) return false;
    }
    if (aramaMetni) {
      const q    = aramaMetni.toLowerCase();
      const d    = (k.daireNo.split("-").pop() ?? "").toLowerCase();
      const blk  = k.blok.toLowerCase();
      const sahip = k.daireSahibi ? `${k.daireSahibi.ad} ${k.daireSahibi.soyad}`.toLowerCase() : "";
      const kiracılar = (k.sozlesmeler ?? [])
        .map(s => s.ogrenci ? `${s.ogrenci.ad} ${s.ogrenci.soyad}` : "")
        .join(" ").toLowerCase();
      if (!d.includes(q) && !blk.includes(q) && !sahip.includes(q) && !kiracılar.includes(q)) return false;
    }
    return true;
  });

  const etap2GruplariF = etap2Parents.reduce<Record<string, Konut[]>>((acc, p) => {
    acc[p] = etap2Filtreli.filter(k => getParentBlok(k.blok) === p);
    return acc;
  }, {});

  // Etap 3
  const etap3Ham       = konutlar.filter(k => k.etap === 3);
  const etap3Bloklar   = [...new Set(etap3Ham.map(k => k.blok))].sort();
  const etap3Filtreli  = etap3Ham.filter(k => filtrele13(k, 3));
  const etap3GruplariF = etap3Bloklar.reduce<Record<string, Konut[]>>((acc, b) => {
    acc[b] = etap3Filtreli.filter(k => k.blok === b).sort((a, z) => {
      const n = (d: string) => parseInt(d.replace(/\D+/g, ""), 10) || 0;
      return n(a.daireNo) - n(z.daireNo);
    });
    return acc;
  }, {});

  // Aktif etap 1/3 için filtre dropdown blok listesi
  const aktifEtap13Bloklar = aktifEtap === 1 ? etap1Bloklar : aktifEtap === 3 ? etap3Bloklar : [];
  const aktifEtap13Ham     = aktifEtap === 1 ? etap1Ham : aktifEtap === 3 ? etap3Ham : [];
  const aktifEtap13Filtreli = aktifEtap === 1 ? etap1Filtreli : aktifEtap === 3 ? etap3Filtreli : [];

  const etapSayilari = ([1, 2, 3] as const).map(e => ({
    etap: e, sayi: konutlar.filter(k => k.etap === e).length,
  }));

  return (
    <div className="space-y-4">
      {/* Etap sekmeleri */}
      <div className="flex gap-1 border-b border-gray-200">
        <button onClick={() => setAktifEtap("tumu")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            aktifEtap === "tumu" ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          Tümü ({konutlar.length})
        </button>
        {etapSayilari.map(({ etap, sayi }) => (
          <button key={etap} onClick={() => setAktifEtap(etap)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              aktifEtap === etap ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {ETAP_LABEL[etap]} ({sayi})
          </button>
        ))}
      </div>

      {/* Üst bar */}
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-500 flex-1">
          {aktifEtap === 2
            ? `${etap2Parents.length} blok · ${etap2Ham.length} daire`
            : aktifEtap === 1
              ? `${etap1Bloklar.length} blok · ${aktifEtap13Filtreli.length} / ${aktifEtap13Ham.length} daire`
            : aktifEtap === 3
              ? `${etap3Bloklar.length} blok · ${aktifEtap13Filtreli.length} / ${aktifEtap13Ham.length} daire`
            : `${filtreli.length} daire`}
        </p>

        {/* Excel Export */}
        <button
          onClick={() => exportExcel(filtreli)}
          className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          <Download size={15} /> Excel İndir
        </button>

        {/* Excel Import */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          <Upload size={15} /> {importing ? "Aktarılıyor..." : "Excel Yükle"}
        </button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />

        {/* Yeni Konut */}
        <button onClick={() => setYeniModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Plus size={16} /> Yeni Konut
        </button>
      </div>

      {/* Import mesajı */}
      {importMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-sm text-emerald-700">
          {importMsg}
        </div>
      )}

      {/* 1. & 3. Etap Filtre & Görünüm Çubuğu */}
      {(aktifEtap === 1 || aktifEtap === 3) && (
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Arama */}
            <div className="relative flex-1 min-w-52">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Daire no, kiracı adı, sahip ara..."
                value={aramaMetni13} onChange={e => setAramaMetni13(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              {aramaMetni13 && (
                <button onClick={() => setAramaMetni13("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13} /></button>
              )}
            </div>
            {/* Blok Filtresi */}
            <select value={blokFiltre13} onChange={e => setBlokFiltre13(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="">Tüm Bloklar</option>
              {aktifEtap13Bloklar.map(b => <option key={b} value={b}>{b} Blok</option>)}
            </select>
            {/* Doluluk Filtresi */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <SlidersHorizontal size={13} className="text-gray-400 ml-1" />
              {(["tumu", "dolu", "bos", "bakimda"] as const).map(v => (
                <button key={v} onClick={() => setDurumFiltre13(v)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    durumFiltre13 === v ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {v === "tumu" ? "Tümü" : v === "dolu" ? "Dolu" : v === "bos" ? "Boş" : "Bakımda"}
                </button>
              ))}
            </div>
            {/* Görünüm Modu */}
            <div className="flex gap-1 ml-auto">
              <button onClick={() => setGorunum13("kart")} title="Kart Görünümü"
                className={`p-2 rounded-lg border transition-colors ${gorunum13 === "kart" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"}`}>
                <LayoutGrid size={15} />
              </button>
              <button onClick={() => setGorunum13("liste")} title="Liste Görünümü"
                className={`p-2 rounded-lg border transition-colors ${gorunum13 === "liste" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"}`}>
                <List size={15} />
              </button>
            </div>
          </div>
          {/* Aktif filtre özeti */}
          {(aramaMetni13 || blokFiltre13 || durumFiltre13 !== "tumu") && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">{aktifEtap13Filtreli.length}</span> daire gösteriliyor
              </span>
              {aramaMetni13 && (
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  &ldquo;{aramaMetni13}&rdquo;<button onClick={() => setAramaMetni13("")}><X size={10} /></button>
                </span>
              )}
              {blokFiltre13 && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {blokFiltre13} Blok<button onClick={() => setBlokFiltre13("")}><X size={10} /></button>
                </span>
              )}
              {durumFiltre13 !== "tumu" && (
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {durumFiltre13 === "dolu" ? "Dolu" : durumFiltre13 === "bos" ? "Boş" : "Bakımda"}
                  <button onClick={() => setDurumFiltre13("tumu")}><X size={10} /></button>
                </span>
              )}
              <button onClick={() => { setAramaMetni13(""); setBlokFiltre13(""); setDurumFiltre13("tumu"); }}
                className="text-xs text-gray-400 hover:text-gray-600 ml-auto">Tümünü temizle</button>
            </div>
          )}
        </div>
      )}

      {/* 2. Etap Filtre & Görünüm Çubuğu */}
      {(aktifEtap === 2) && (
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Arama */}
            <div className="relative flex-1 min-w-52">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Daire no, kiracı adı, sahip ara..."
                value={aramaMetni}
                onChange={e => setAramaMetni(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {aramaMetni && (
                <button onClick={() => setAramaMetni("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Blok Filtresi */}
            <select value={blokFiltre2} onChange={e => setBlokFiltre2(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="">Tüm Bloklar</option>
              {etap2Parents.map(p => <option key={p} value={p}>{p} Blok</option>)}
            </select>

            {/* Doluluk Filtresi */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <SlidersHorizontal size={13} className="text-gray-400 ml-1" />
              {(["tumu", "dolu", "karma", "bos"] as const).map(v => (
                <button key={v}
                  onClick={() => setDurumFiltre2(v)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    durumFiltre2 === v
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}>
                  {v === "tumu" ? "Tümü" : v === "dolu" ? "Dolu" : v === "karma" ? "Karma" : "Boş"}
                </button>
              ))}
            </div>

            {/* Görünüm Modu */}
            <div className="flex gap-1 ml-auto">
              <button onClick={() => setGorunum2("kart")} title="Kart Görünümü"
                className={`p-2 rounded-lg border transition-colors ${
                  gorunum2 === "kart"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                }`}>
                <LayoutGrid size={15} />
              </button>
              <button onClick={() => setGorunum2("liste")} title="Liste Görünümü"
                className={`p-2 rounded-lg border transition-colors ${
                  gorunum2 === "liste"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                }`}>
                <List size={15} />
              </button>
            </div>
          </div>

          {/* Aktif filtre özeti */}
          {(aramaMetni || blokFiltre2 || durumFiltre2 !== "tumu") && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">{etap2Filtreli.length}</span> daire gösteriliyor
              </span>
              {aramaMetni && (
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  &ldquo;{aramaMetni}&rdquo;
                  <button onClick={() => setAramaMetni("")}><X size={10} /></button>
                </span>
              )}
              {blokFiltre2 && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {blokFiltre2} Blok
                  <button onClick={() => setBlokFiltre2("")}><X size={10} /></button>
                </span>
              )}
              {durumFiltre2 !== "tumu" && (
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {durumFiltre2 === "dolu" ? "Dolu" : durumFiltre2 === "bos" ? "Boş" : "Karma"}
                  <button onClick={() => setDurumFiltre2("tumu")}><X size={10} /></button>
                </span>
              )}
              <button
                onClick={() => { setAramaMetni(""); setBlokFiltre2(""); setDurumFiltre2("tumu"); }}
                className="text-xs text-gray-400 hover:text-gray-600 ml-auto">
                Tümünü temizle
              </button>
            </div>
          )}
        </div>
      )}

      {/* Blok grupları */}
      <div className="space-y-3">
        {/* Etap 1 — kart veya liste görünümü */}
        {(aktifEtap === 1 || aktifEtap === "tumu") && (
          aktifEtap === 1 && gorunum13 === "kart"
            ? etap1Bloklar.filter(b => (etap1GruplariF[b]?.length ?? 0) > 0).map(b => (
                <EtapKartBlokGrubu key={b} blok={b} daireler={etap1GruplariF[b]} onRefresh={load} />
              ))
            : etap1Bloklar.filter(b => (etap1GruplariF[b]?.length ?? 0) > 0).map(b => (
                <BlokGrubu key={b} blok={b} daireler={etap1GruplariF[b]} onRefresh={load} />
              ))
        )}

        {/* Etap 2 — liste veya kart görünümü */}
        {(aktifEtap === 2 || aktifEtap === "tumu") && (
          gorunum2 === "liste" && aktifEtap === 2
            ? <Etap2ListeGorunum konutlar={etap2Filtreli} onRefresh={load} />
            : etap2Parents
                .filter(p => etap2GruplariF[p]?.length > 0)
                .map(p => (
                  <Etap2BlokGrubu key={p} parentBlok={p} konutlar={etap2GruplariF[p]} onRefresh={load} />
                ))
        )}

        {/* Etap 3 — kart veya liste görünümü */}
        {(aktifEtap === 3 || aktifEtap === "tumu") && (
          aktifEtap === 3 && gorunum13 === "kart"
            ? etap3Bloklar.filter(b => (etap3GruplariF[b]?.length ?? 0) > 0).map(b => (
                <EtapKartBlokGrubu key={`e3-${b}`} blok={b} daireler={etap3GruplariF[b]} onRefresh={load} />
              ))
            : etap3Bloklar.filter(b => (etap3GruplariF[b]?.length ?? 0) > 0).map(b => (
                <BlokGrubu key={`e3-${b}`} blok={b} daireler={etap3GruplariF[b]} onRefresh={load} />
              ))
        )}
      </div>

      {aktifEtap === 1 && etap1Ham.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">1. Etapta konut bulunmuyor</div>
      )}
      {aktifEtap === 1 && etap1Filtreli.length === 0 && etap1Ham.length > 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">Filtreyle eşleşen daire bulunamadı</div>
      )}
      {aktifEtap === 2 && etap2Filtreli.length === 0 && etap2Ham.length > 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">Filtreyle eşleşen daire bulunamadı</div>
      )}
      {aktifEtap === 3 && etap3Ham.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">3. Etapta konut bulunmuyor</div>
      )}
      {aktifEtap === 3 && etap3Filtreli.length === 0 && etap3Ham.length > 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">Filtreyle eşleşen daire bulunamadı</div>
      )}

      {/* Yeni Konut Modalı */}
      {yeniModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Yeni Konut Ekle</h3>
              <button onClick={() => setYeniModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Etap</label>
                  <select value={yeniForm.etap} onChange={e => setYeniForm(f => ({ ...f, etap: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                    <option value="1">1. Etap</option><option value="2">2. Etap</option><option value="3">3. Etap</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Blok</label>
                  <input value={yeniForm.blok} onChange={e => setYeniForm(f => ({ ...f, blok: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="A" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Kat No</label>
                  <input type="number" value={yeniForm.katNo}
                    onChange={e => setYeniForm(f => ({ ...f, katNo: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Daire No</label>
                  <input value={yeniForm.daireNo} onChange={e => setYeniForm(f => ({ ...f, daireNo: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="A-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Tip</label>
                  <select value={yeniForm.tip} onChange={e => setYeniForm(f => ({ ...f, tip: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                    <option>1+1</option><option>2+1</option><option>3+1</option><option>Stüdyo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">m²</label>
                  <input type="number" value={yeniForm.metrekare}
                    onChange={e => setYeniForm(f => ({ ...f, metrekare: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Aylık Kira (₺)</label>
                  <input type="number" value={yeniForm.kiraBedeli}
                    onChange={e => setYeniForm(f => ({ ...f, kiraBedeli: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Durum</label>
                  <select value={yeniForm.durum} onChange={e => setYeniForm(f => ({ ...f, durum: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                    <option value="Bos">Boş</option><option value="Dolu">Dolu</option><option value="Bakimda">Bakımda</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setYeniModal(false)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
              <button onClick={ekle}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
