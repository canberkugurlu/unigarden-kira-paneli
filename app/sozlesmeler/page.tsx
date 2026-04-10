"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, FileText, Download, Pencil, Trash2, Search, X } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import * as XLSX from "xlsx";

interface Sozlesme {
  id: string; sozlesmeNo: string; durum: string;
  aylikKira: number; depozito: number; kiraOdemGunu: number;
  baslangicTarihi: string; bitisTarihi: string; ozelSartlar?: string;
  konut: { id: string; daireNo: string; blok: string };
  ogrenci: { id: string; ad: string; soyad: string };
}

const DURUM_RENK: Record<string, string> = {
  Aktif: "bg-green-100 text-green-700",
  "Sona Erdi": "bg-gray-100 text-gray-600",
  Iptal: "bg-red-100 text-red-700",
};

function EditModal({ s, onClose, onSaved }: { s: Sozlesme; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    aylikKira: String(s.aylikKira), depozito: String(s.depozito),
    kiraOdemGunu: String(s.kiraOdemGunu), durum: s.durum,
    baslangicTarihi: s.baslangicTarihi.slice(0, 10),
    bitisTarihi: s.bitisTarihi.slice(0, 10),
    ozelSartlar: s.ozelSartlar ?? "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/sozlesmeler/${s.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, aylikKira: Number(form.aylikKira), depozito: Number(form.depozito), kiraOdemGunu: Number(form.kiraOdemGunu) }),
    });
    setSaving(false); onSaved(); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Sözleşme Düzenle — {s.sozlesmeNo}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Başlangıç</label><input type="date" value={form.baslangicTarihi} onChange={e => setForm(f=>({...f,baslangicTarihi:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">Bitiş</label><input type="date" value={form.bitisTarihi} onChange={e => setForm(f=>({...f,bitisTarihi:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs text-gray-500">Aylık Kira</label><input type="number" value={form.aylikKira} onChange={e=>setForm(f=>({...f,aylikKira:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">Depozito</label><input type="number" value={form.depozito} onChange={e=>setForm(f=>({...f,depozito:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">Ödeme Günü</label><input type="number" min={1} max={28} value={form.kiraOdemGunu} onChange={e=>setForm(f=>({...f,kiraOdemGunu:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          </div>
          <div><label className="text-xs text-gray-500">Durum</label>
            <select value={form.durum} onChange={e=>setForm(f=>({...f,durum:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
              <option value="Aktif">Aktif</option><option value="Sona Erdi">Sona Erdi</option><option value="Iptal">İptal</option>
            </select>
          </div>
          <div><label className="text-xs text-gray-500">Özel Şartlar</label><textarea value={form.ozelSartlar} onChange={e=>setForm(f=>({...f,ozelSartlar:e.target.value}))} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={save} disabled={saving} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60">{saving?"Kaydediliyor...":"Kaydet"}</button>
        </div>
      </div>
    </div>
  );
}

export default function SozlesmelerPage() {
  const [sozlesmeler, setSozlesmeler] = useState<Sozlesme[]>([]);
  const [editItem, setEditItem] = useState<Sozlesme | null>(null);
  const [silOnay, setSilOnay] = useState<string | null>(null);
  const [arama, setArama]     = useState("");
  const [durumFiltre, setDurumFiltre] = useState("");

  const load = useCallback(() => fetch("/api/sozlesmeler").then(r=>r.json()).then(setSozlesmeler), []);
  useEffect(()=>{load();}, [load]);

  const sil = async (id: string) => {
    await fetch(`/api/sozlesmeler/${id}`, { method: "DELETE" });
    setSilOnay(null); load();
  };

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(n);
  const fmtT = (d: string) => format(new Date(d), "d MMM yyyy", { locale: tr });

  const exportExcel = () => {
    const rows = gosterilen.map(s => ({
      "Sözleşme No": s.sozlesmeNo, "Kiracı": `${s.ogrenci.ad} ${s.ogrenci.soyad}`,
      "Daire": `${s.konut.blok} / ${s.konut.daireNo}`,
      "Başlangıç": fmtT(s.baslangicTarihi), "Bitiş": fmtT(s.bitisTarihi),
      "Aylık Kira": s.aylikKira, "Depozito": s.depozito, "Durum": s.durum,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sözleşmeler");
    XLSX.writeFile(wb, `UNIGARDEN_Sozlesmeler_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const gosterilen = sozlesmeler.filter(s => {
    const q = arama.toLowerCase();
    if (q && !`${s.ogrenci.ad} ${s.ogrenci.soyad}`.toLowerCase().includes(q) && !s.sozlesmeNo.toLowerCase().includes(q) && !s.konut.daireNo.toLowerCase().includes(q)) return false;
    if (durumFiltre && s.durum !== durumFiltre) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={arama} onChange={e=>setArama(e.target.value)} placeholder="Kiracı, sözleşme no veya daire..."
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" />
        </div>
        <select value={durumFiltre} onChange={e=>setDurumFiltre(e.target.value)} className="border rounded-lg px-3 py-2 text-sm text-gray-600">
          <option value="">Tüm Durumlar</option>
          <option value="Aktif">Aktif</option>
          <option value="Sona Erdi">Sona Erdi</option>
          <option value="Iptal">İptal</option>
        </select>
        <button onClick={exportExcel} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
          <Download size={15} /> Excel İndir
        </button>
        <Link href="/sozlesmeler/yeni"
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
          <Plus size={16} /> Yeni Sözleşme
        </Link>
      </div>

      <p className="text-xs text-gray-400">{gosterilen.length} / {sozlesmeler.length} sözleşme</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Sözleşme No</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Kiracı</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Daire</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Başlangıç</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Bitiş</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Aylık Kira</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Durum</th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {gosterilen.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-600"><FileText size={12} className="inline mr-1" />{s.sozlesmeNo}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{s.ogrenci.ad} {s.ogrenci.soyad}</td>
                <td className="px-4 py-3 text-gray-500">Blok {s.konut.blok} / {s.konut.daireNo}</td>
                <td className="px-4 py-3 text-gray-500">{fmtT(s.baslangicTarihi)}</td>
                <td className="px-4 py-3 text-gray-500">{fmtT(s.bitisTarihi)}</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">{fmt(s.aylikKira)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${DURUM_RENK[s.durum]??"bg-gray-100 text-gray-600"}`}>{s.durum}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setEditItem(s)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Pencil size={14} /></button>
                    <button onClick={() => setSilOnay(s.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {gosterilen.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Kayıt bulunamadı</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editItem && <EditModal s={editItem} onClose={() => setEditItem(null)} onSaved={load} />}
      {silOnay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <p className="text-gray-700 mb-4">Bu sözleşmeyi silmek istediğinize emin misiniz?</p>
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
