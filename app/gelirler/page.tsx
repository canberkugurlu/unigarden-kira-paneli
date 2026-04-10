"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Download, Search, X } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import * as XLSX from "xlsx";

interface Odeme {
  id: string; tutar: number; tip: string; odenmeTarihi: string; aciklama?: string;
  sozlesme: { id: string; sozlesmeNo: string; ogrenci: { ad: string; soyad: string }; konut: { daireNo: string; blok: string } };
}
interface Sozlesme { id: string; sozlesmeNo: string; ogrenci: { ad: string; soyad: string }; durum: string }

function EditModal({ o, onClose, onSaved }: { o: Odeme; onClose:()=>void; onSaved:()=>void }) {
  const [form, setForm] = useState({ tutar: String(o.tutar), tip: o.tip, odenmeTarihi: o.odenmeTarihi.slice(0,10), aciklama: o.aciklama??""  });
  const save = async () => {
    await fetch(`/api/odemeler/${o.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...form, tutar: Number(form.tutar)}) });
    onSaved(); onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Gelir Düzenle</h3><button onClick={onClose}><X size={18} className="text-gray-400"/></button></div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Tutar (₺)</label><input type="number" value={form.tutar} onChange={e=>setForm(f=>({...f,tutar:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
            <div><label className="text-xs text-gray-500">Tür</label>
              <select value={form.tip} onChange={e=>setForm(f=>({...f,tip:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                <option value="Kira">Kira</option><option value="Depozito">Depozito</option><option value="Gecikme Faizi">Gecikme Faizi</option><option value="Diger">Diğer</option>
              </select>
            </div>
          </div>
          <div><label className="text-xs text-gray-500">Tarih</label><input type="date" value={form.odenmeTarihi} onChange={e=>setForm(f=>({...f,odenmeTarihi:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
          <div><label className="text-xs text-gray-500">Açıklama</label><input value={form.aciklama} onChange={e=>setForm(f=>({...f,aciklama:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={save} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700">Kaydet</button>
        </div>
      </div>
    </div>
  );
}

export default function GelirlerPage() {
  const [odemeler, setOdemeler] = useState<Odeme[]>([]);
  const [sozlesmeler, setSozlesmeler] = useState<Sozlesme[]>([]);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<Odeme|null>(null);
  const [silOnay, setSilOnay] = useState<string|null>(null);
  const [arama, setArama] = useState("");
  const [tipFiltre, setTipFiltre] = useState("");
  const [tarihBas, setTarihBas] = useState("");
  const [tarihBit, setTarihBit] = useState("");
  const [yeniForm, setYeniForm] = useState({ sozlesmeId:"", tutar:"", tip:"Kira", odenmeTarihi: new Date().toISOString().slice(0,10), aciklama:"" });

  const load = useCallback(() => {
    fetch("/api/odemeler").then(r=>r.json()).then(setOdemeler);
    fetch("/api/sozlesmeler").then(r=>r.json()).then(setSozlesmeler);
  }, []);
  useEffect(()=>{load();}, [load]);

  const sil = async (id: string) => { await fetch(`/api/odemeler/${id}`,{method:"DELETE"}); setSilOnay(null); load(); };

  const kaydet = async () => {
    await fetch("/api/odemeler", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...yeniForm, tutar: Number(yeniForm.tutar)}) });
    setModal(false); setYeniForm({sozlesmeId:"",tutar:"",tip:"Kira",odenmeTarihi:new Date().toISOString().slice(0,10),aciklama:""}); load();
  };

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(n);
  const fmtT = (d: string) => format(new Date(d),"d MMM yyyy",{locale:tr});

  const gosterilen = odemeler.filter(o => {
    const q = arama.toLowerCase();
    if (q && !`${o.sozlesme.ogrenci.ad} ${o.sozlesme.ogrenci.soyad}`.toLowerCase().includes(q) && !o.sozlesme.konut.daireNo.toLowerCase().includes(q)) return false;
    if (tipFiltre && o.tip !== tipFiltre) return false;
    if (tarihBas && o.odenmeTarihi < tarihBas) return false;
    if (tarihBit && o.odenmeTarihi > tarihBit+"T23:59:59") return false;
    return true;
  });

  const toplam = gosterilen.reduce((s,o)=>s+o.tutar,0);

  const exportExcel = () => {
    const rows = gosterilen.map(o=>({ "Sözleşme No":o.sozlesme.sozlesmeNo, "Kiracı":`${o.sozlesme.ogrenci.ad} ${o.sozlesme.ogrenci.soyad}`, "Daire":o.sozlesme.konut.daireNo, "Tür":o.tip, "Tutar":o.tutar, "Tarih":fmtT(o.odenmeTarihi), "Açıklama":o.aciklama??"" }));
    const ws=XLSX.utils.json_to_sheet(rows); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Gelirler");
    XLSX.writeFile(wb,`UNIGARDEN_Gelirler_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const aktifSoz = sozlesmeler.filter(s=>s.durum==="Aktif");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={arama} onChange={e=>setArama(e.target.value)} placeholder="Kiracı veya daire ara..." className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"/>
        </div>
        <select value={tipFiltre} onChange={e=>setTipFiltre(e.target.value)} className="border rounded-lg px-3 py-2 text-sm text-gray-600">
          <option value="">Tüm Türler</option>
          <option value="Kira">Kira</option><option value="Depozito">Depozito</option><option value="Gecikme Faizi">Gecikme Faizi</option><option value="Diger">Diğer</option>
        </select>
        <input type="date" value={tarihBas} onChange={e=>setTarihBas(e.target.value)} className="border rounded-lg px-3 py-2 text-sm text-gray-600" title="Başlangıç tarihi"/>
        <input type="date" value={tarihBit} onChange={e=>setTarihBit(e.target.value)} className="border rounded-lg px-3 py-2 text-sm text-gray-600" title="Bitiş tarihi"/>
        <button onClick={exportExcel} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"><Download size={15}/> Excel İndir</button>
        <button onClick={()=>setModal(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"><Plus size={16}/> Gelir Ekle</button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{gosterilen.length} kayıt</p>
        <p className="text-lg font-bold text-green-600">{fmt(toplam)}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Sözleşme</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Kiracı</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Daire</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Tür</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Tutar</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Tarih</th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {gosterilen.map(o=>(
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.sozlesme.sozlesmeNo}</td>
                <td className="px-4 py-3 text-gray-800">{o.sozlesme.ogrenci.ad} {o.sozlesme.ogrenci.soyad}</td>
                <td className="px-4 py-3 text-gray-500">{o.sozlesme.konut.daireNo}</td>
                <td className="px-4 py-3"><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{o.tip}</span></td>
                <td className="px-4 py-3 font-semibold text-green-600">{fmt(o.tutar)}</td>
                <td className="px-4 py-3 text-gray-500">{fmtT(o.odenmeTarihi)}</td>
                <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                  <button onClick={()=>setEditItem(o)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Pencil size={14}/></button>
                  <button onClick={()=>setSilOnay(o.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14}/></button>
                </div></td>
              </tr>
            ))}
            {gosterilen.length===0&&<tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Kayıt bulunamadı</td></tr>}
          </tbody>
        </table>
      </div>

      {editItem && <EditModal o={editItem} onClose={()=>setEditItem(null)} onSaved={load}/>}
      {silOnay&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <p className="text-gray-700 mb-4">Bu gelir kaydını silmek istediğinize emin misiniz?</p>
            <div className="flex gap-3">
              <button onClick={()=>setSilOnay(null)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
              <button onClick={()=>sil(silOnay)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700">Sil</button>
            </div>
          </div>
        </div>
      )}

      {modal&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Yeni Gelir Girişi</h3><button onClick={()=>setModal(false)}><X size={18} className="text-gray-400"/></button></div>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-500">Sözleşme</label>
                <select value={yeniForm.sozlesmeId} onChange={e=>setYeniForm(f=>({...f,sozlesmeId:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                  <option value="">— Sözleşme seçin —</option>
                  {aktifSoz.map(s=><option key={s.id} value={s.id}>{s.sozlesmeNo} — {s.ogrenci.ad} {s.ogrenci.soyad}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Tutar (₺)</label><input type="number" value={yeniForm.tutar} onChange={e=>setYeniForm(f=>({...f,tutar:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
                <div><label className="text-xs text-gray-500">Tür</label>
                  <select value={yeniForm.tip} onChange={e=>setYeniForm(f=>({...f,tip:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                    <option value="Kira">Kira</option><option value="Depozito">Depozito</option><option value="Gecikme Faizi">Gecikme Faizi</option><option value="Diger">Diğer</option>
                  </select>
                </div>
              </div>
              <div><label className="text-xs text-gray-500">Tarih</label><input type="date" value={yeniForm.odenmeTarihi} onChange={e=>setYeniForm(f=>({...f,odenmeTarihi:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
              <div><label className="text-xs text-gray-500">Açıklama</label><input value={yeniForm.aciklama} onChange={e=>setYeniForm(f=>({...f,aciklama:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={()=>setModal(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
              <button onClick={kaydet} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
