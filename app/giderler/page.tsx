"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Download, Search, X } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import * as XLSX from "xlsx";

interface Gider { id: string; baslik: string; tutar: number; kategori: string; tarih: string; aciklama?: string }

const KAT_RENK: Record<string,string> = { Bakim:"bg-blue-100 text-blue-700", Onarim:"bg-orange-100 text-orange-700", Fatura:"bg-purple-100 text-purple-700", Yonetim:"bg-gray-100 text-gray-700", Diger:"bg-pink-100 text-pink-700" };
const KAT_LABEL: Record<string,string> = { Bakim:"Bakım", Onarim:"Onarım", Fatura:"Fatura", Yonetim:"Yönetim", Diger:"Diğer" };

function EditModal({ g, onClose, onSaved }: { g: Gider; onClose:()=>void; onSaved:()=>void }) {
  const [form, setForm] = useState({ baslik:g.baslik, tutar:String(g.tutar), kategori:g.kategori, tarih:g.tarih.slice(0,10), aciklama:g.aciklama??"" });
  const save = async () => {
    await fetch(`/api/giderler/${g.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...form,tutar:Number(form.tutar)}) });
    onSaved(); onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Gider Düzenle</h3><button onClick={onClose}><X size={18} className="text-gray-400"/></button></div>
        <div className="space-y-3">
          <div><label className="text-xs text-gray-500">Başlık</label><input value={form.baslik} onChange={e=>setForm(f=>({...f,baslik:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Tutar (₺)</label><input type="number" value={form.tutar} onChange={e=>setForm(f=>({...f,tutar:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
            <div><label className="text-xs text-gray-500">Kategori</label>
              <select value={form.kategori} onChange={e=>setForm(f=>({...f,kategori:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                {Object.entries(KAT_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div><label className="text-xs text-gray-500">Tarih</label><input type="date" value={form.tarih} onChange={e=>setForm(f=>({...f,tarih:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
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

export default function GiderlerPage() {
  const [giderler, setGiderler] = useState<Gider[]>([]);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<Gider|null>(null);
  const [silOnay, setSilOnay] = useState<string|null>(null);
  const [arama, setArama] = useState("");
  const [katFiltre, setKatFiltre] = useState("");
  const [tarihBas, setTarihBas] = useState("");
  const [tarihBit, setTarihBit] = useState("");
  const [yeniForm, setYeniForm] = useState({ baslik:"", tutar:"", kategori:"Bakim", tarih:new Date().toISOString().slice(0,10), aciklama:"" });

  const load = useCallback(() => fetch("/api/giderler").then(r=>r.json()).then(setGiderler), []);
  useEffect(()=>{load();}, [load]);

  const sil = async (id: string) => { await fetch(`/api/giderler/${id}`,{method:"DELETE"}); setSilOnay(null); load(); };
  const kaydet = async () => {
    await fetch("/api/giderler", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...yeniForm,tutar:Number(yeniForm.tutar)}) });
    setModal(false); setYeniForm({baslik:"",tutar:"",kategori:"Bakim",tarih:new Date().toISOString().slice(0,10),aciklama:""}); load();
  };

  const fmt = (n: number) => new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(n);
  const fmtT = (d: string) => format(new Date(d),"d MMM yyyy",{locale:tr});

  const gosterilen = giderler.filter(g => {
    const q = arama.toLowerCase();
    if (q && !g.baslik.toLowerCase().includes(q) && !(g.aciklama??"").toLowerCase().includes(q)) return false;
    if (katFiltre && g.kategori !== katFiltre) return false;
    if (tarihBas && g.tarih < tarihBas) return false;
    if (tarihBit && g.tarih > tarihBit) return false;
    return true;
  });
  const toplam = gosterilen.reduce((s,g)=>s+g.tutar,0);

  const exportExcel = () => {
    const rows = gosterilen.map(g=>({ "Başlık":g.baslik, "Kategori":KAT_LABEL[g.kategori]??g.kategori, "Tutar":g.tutar, "Tarih":fmtT(g.tarih), "Açıklama":g.aciklama??"" }));
    const ws=XLSX.utils.json_to_sheet(rows); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Giderler");
    XLSX.writeFile(wb,`UNIGARDEN_Giderler_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={arama} onChange={e=>setArama(e.target.value)} placeholder="Başlık veya açıklama ara..." className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"/>
        </div>
        <select value={katFiltre} onChange={e=>setKatFiltre(e.target.value)} className="border rounded-lg px-3 py-2 text-sm text-gray-600">
          <option value="">Tüm Kategoriler</option>
          {Object.entries(KAT_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
        <input type="date" value={tarihBas} onChange={e=>setTarihBas(e.target.value)} className="border rounded-lg px-3 py-2 text-sm text-gray-600" title="Başlangıç tarihi"/>
        <input type="date" value={tarihBit} onChange={e=>setTarihBit(e.target.value)} className="border rounded-lg px-3 py-2 text-sm text-gray-600" title="Bitiş tarihi"/>
        <button onClick={exportExcel} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"><Download size={15}/> Excel İndir</button>
        <button onClick={()=>setModal(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"><Plus size={16}/> Gider Ekle</button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{gosterilen.length} kayıt</p>
        <p className="text-lg font-bold text-red-600">{fmt(toplam)}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Başlık</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Kategori</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Tutar</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Tarih</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Açıklama</th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {gosterilen.map(g=>(
              <tr key={g.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{g.baslik}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${KAT_RENK[g.kategori]??"bg-gray-100 text-gray-600"}`}>{KAT_LABEL[g.kategori]??g.kategori}</span></td>
                <td className="px-4 py-3 font-semibold text-red-600">{fmt(g.tutar)}</td>
                <td className="px-4 py-3 text-gray-500">{fmtT(g.tarih)}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{g.aciklama??"-"}</td>
                <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                  <button onClick={()=>setEditItem(g)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Pencil size={14}/></button>
                  <button onClick={()=>setSilOnay(g.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14}/></button>
                </div></td>
              </tr>
            ))}
            {gosterilen.length===0&&<tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Kayıt bulunamadı</td></tr>}
          </tbody>
        </table>
      </div>

      {editItem && <EditModal g={editItem} onClose={()=>setEditItem(null)} onSaved={load}/>}
      {silOnay&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <p className="text-gray-700 mb-4">Bu gider kaydını silmek istediğinize emin misiniz?</p>
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
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Yeni Gider Girişi</h3><button onClick={()=>setModal(false)}><X size={18} className="text-gray-400"/></button></div>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-500">Başlık</label><input value={yeniForm.baslik} onChange={e=>setYeniForm(f=>({...f,baslik:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Klima tamiri"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Tutar (₺)</label><input type="number" value={yeniForm.tutar} onChange={e=>setYeniForm(f=>({...f,tutar:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
                <div><label className="text-xs text-gray-500">Kategori</label>
                  <select value={yeniForm.kategori} onChange={e=>setYeniForm(f=>({...f,kategori:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                    {Object.entries(KAT_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-xs text-gray-500">Tarih</label><input type="date" value={yeniForm.tarih} onChange={e=>setYeniForm(f=>({...f,tarih:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm mt-1"/></div>
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
