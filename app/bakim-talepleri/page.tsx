"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Wrench, Search, X, Download, ChevronDown, Send } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import * as XLSX from "xlsx";

interface BakimTalebi {
  id: string; baslik: string; aciklama: string; durum: string; oncelik: string;
  olusturmaTar: string; tamamlanmaTar?: string;
  ogrenci: { id: string; ad: string; soyad: string };
  konut: { id: string; daireNo: string; blok: string; etap: number };
}

const DURUM_RENK: Record<string, string> = {
  Bekliyor: "bg-yellow-100 text-yellow-700",
  Islemde: "bg-blue-100 text-blue-700",
  Tamamlandi: "bg-green-100 text-green-700",
  Iptal: "bg-gray-100 text-gray-500",
};
const ONCELIK_RENK: Record<string, string> = {
  Dusuk: "bg-gray-100 text-gray-500",
  Normal: "bg-blue-100 text-blue-600",
  Yuksek: "bg-orange-100 text-orange-700",
  Acil: "bg-red-100 text-red-700",
};
const DURUM_LABEL: Record<string, string> = { Bekliyor: "Bekliyor", Islemde: "İşlemde", Tamamlandi: "Tamamlandı", Iptal: "İptal" };
const ONCELIK_LABEL: Record<string, string> = { Dusuk: "Düşük", Normal: "Normal", Yuksek: "Yüksek", Acil: "Acil" };

interface Yorum {
  id: string; icerik: string; yazarTip: string; yazarAd: string; olusturmaTar: string;
}

function DetailModal({ t, onClose, onSaved }: { t: BakimTalebi; onClose: () => void; onSaved: () => void }) {
  const [durum, setDurum] = useState(t.durum);
  const [oncelik, setOncelik] = useState(t.oncelik);
  const [saving, setSaving] = useState(false);
  const [yorumlar, setYorumlar] = useState<Yorum[]>([]);
  const [yeniYorum, setYeniYorum] = useState("");
  const [yorumGonderiyor, setYorumGonderiyor] = useState(false);

  useEffect(() => {
    fetch(`/api/bakim-talepleri/${t.id}/yorumlar`).then(r => r.json()).then(setYorumlar);
  }, [t.id]);

  const save = async () => {
    setSaving(true);
    const data: Record<string, unknown> = { durum, oncelik };
    if (durum === "Tamamlandi" && !t.tamamlanmaTar) data.tamamlanmaTar = new Date().toISOString();
    await fetch(`/api/bakim-talepleri/${t.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false); onSaved(); onClose();
  };

  const yorumGonder = async () => {
    if (!yeniYorum.trim()) return;
    setYorumGonderiyor(true);
    const res = await fetch(`/api/bakim-talepleri/${t.id}/yorumlar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icerik: yeniYorum, yazarTip: "Admin", yazarId: "admin", yazarAd: "Admin" }),
    });
    if (res.ok) {
      const y = await res.json();
      setYorumlar(prev => [...prev, y]);
      setYeniYorum("");
    }
    setYorumGonderiyor(false);
  };

  const fmtT = (d: string) => format(new Date(d), "d MMM yyyy HH:mm", { locale: tr });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Bakım Talebi Detayı</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="font-semibold text-gray-800">{t.baslik}</p>
            <p className="text-sm text-gray-600">{t.aciklama}</p>
            <div className="flex gap-4 text-xs text-gray-400 pt-1">
              <span>Kiracı: <strong className="text-gray-600">{t.ogrenci.ad} {t.ogrenci.soyad}</strong></span>
              <span>Daire: <strong className="text-gray-600">{t.konut.daireNo}</strong></span>
            </div>
            <p className="text-xs text-gray-400">Oluşturulma: {fmtT(t.olusturmaTar)}</p>
            {t.tamamlanmaTar && <p className="text-xs text-green-600">Tamamlanma: {fmtT(t.tamamlanmaTar)}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Durum</label>
              <select value={durum} onChange={e => setDurum(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                {Object.entries(DURUM_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Öncelik</label>
              <select value={oncelik} onChange={e => setOncelik(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                {Object.entries(ONCELIK_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Yorumlar */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Yorumlar ({yorumlar.length})</p>
            <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
              {yorumlar.length === 0 && <p className="text-xs text-gray-300 italic">Henüz yorum yok</p>}
              {yorumlar.map(y => (
                <div key={y.id} className={`rounded-lg px-3 py-2 text-xs ${y.yazarTip === "Admin" ? "bg-emerald-50 text-emerald-800 ml-6" : "bg-gray-50 text-gray-700 mr-6"}`}>
                  <p className="font-medium mb-0.5">{y.yazarAd} <span className="font-normal text-gray-400">· {fmtT(y.olusturmaTar)}</span></p>
                  <p>{y.icerik}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={yeniYorum} onChange={e => setYeniYorum(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); yorumGonder(); } }}
                placeholder="Yorum yaz..." className="flex-1 border rounded-lg px-3 py-2 text-sm" />
              <button onClick={yorumGonder} disabled={yorumGonderiyor || !yeniYorum.trim()}
                className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">Kapat</button>
          <button onClick={save} disabled={saving} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60">
            {saving ? "Kaydediliyor..." : "Güncelle"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BakimTalepleriPage() {
  const [talepler, setTalepler] = useState<BakimTalebi[]>([]);
  const [detay, setDetay] = useState<BakimTalebi | null>(null);
  const [arama, setArama] = useState("");
  const [durumFiltre, setDurumFiltre] = useState("");
  const [oncelikFiltre, setOncelikFiltre] = useState("");

  const load = useCallback(() => fetch("/api/bakim-talepleri").then(r => r.json()).then(setTalepler), []);
  useEffect(() => { load(); }, [load]);

  const fmtT = (d: string) => format(new Date(d), "d MMM yyyy", { locale: tr });

  const gosterilen = talepler.filter(t => {
    const q = arama.toLowerCase();
    if (q && !t.baslik.toLowerCase().includes(q) && !`${t.ogrenci.ad} ${t.ogrenci.soyad}`.toLowerCase().includes(q) && !t.konut.daireNo.toLowerCase().includes(q)) return false;
    if (durumFiltre && t.durum !== durumFiltre) return false;
    if (oncelikFiltre && t.oncelik !== oncelikFiltre) return false;
    return true;
  });

  const bekleyen = talepler.filter(t => t.durum === "Bekliyor").length;
  const islemde = talepler.filter(t => t.durum === "Islemde").length;

  const exportExcel = () => {
    const rows = gosterilen.map(t => ({
      "Başlık": t.baslik, "Kiracı": `${t.ogrenci.ad} ${t.ogrenci.soyad}`,
      "Daire": t.konut.daireNo, "Durum": DURUM_LABEL[t.durum] ?? t.durum,
      "Öncelik": ONCELIK_LABEL[t.oncelik] ?? t.oncelik,
      "Tarih": fmtT(t.olusturmaTar), "Açıklama": t.aciklama,
    }));
    const ws = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bakım Talepleri");
    XLSX.writeFile(wb, `UNIGARDEN_BakimTalepleri_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Özet kartlar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Toplam", value: talepler.length, color: "text-gray-700", bg: "bg-gray-50" },
          { label: "Bekliyor", value: bekleyen, color: "text-yellow-700", bg: "bg-yellow-50" },
          { label: "İşlemde", value: islemde, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Tamamlandı", value: talepler.filter(t => t.durum === "Tamamlandi").length, color: "text-green-700", bg: "bg-green-50" },
        ].map(card => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4`}>
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={arama} onChange={e => setArama(e.target.value)} placeholder="Başlık, kiracı veya daire..."
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" />
        </div>
        <select value={durumFiltre} onChange={e => setDurumFiltre(e.target.value)} className="border rounded-lg px-3 py-2 text-sm text-gray-600">
          <option value="">Tüm Durumlar</option>
          {Object.entries(DURUM_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={oncelikFiltre} onChange={e => setOncelikFiltre(e.target.value)} className="border rounded-lg px-3 py-2 text-sm text-gray-600">
          <option value="">Tüm Öncelikler</option>
          {Object.entries(ONCELIK_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={exportExcel} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"><Download size={15} /> Excel İndir</button>
      </div>

      <p className="text-xs text-gray-400">{gosterilen.length} kayıt</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Başlık</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Kiracı</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Daire</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Öncelik</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Durum</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Tarih</th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">Detay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {gosterilen.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2"><Wrench size={13} className="text-gray-400" /><span className="font-medium text-gray-800">{t.baslik}</span></div>
                </td>
                <td className="px-4 py-3 text-gray-600">{t.ogrenci.ad} {t.ogrenci.soyad}</td>
                <td className="px-4 py-3 text-gray-500">{t.konut.daireNo}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ONCELIK_RENK[t.oncelik] ?? "bg-gray-100 text-gray-600"}`}>{ONCELIK_LABEL[t.oncelik] ?? t.oncelik}</span></td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DURUM_RENK[t.durum] ?? "bg-gray-100 text-gray-600"}`}>{DURUM_LABEL[t.durum] ?? t.durum}</span></td>
                <td className="px-4 py-3 text-gray-500">{fmtT(t.olusturmaTar)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setDetay(t)} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 ml-auto">
                    Detay <ChevronDown size={12} />
                  </button>
                </td>
              </tr>
            ))}
            {gosterilen.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Kayıt bulunamadı</td></tr>}
          </tbody>
        </table>
      </div>

      {detay && <DetailModal t={detay} onClose={() => setDetay(null)} onSaved={load} />}
    </div>
  );
}
