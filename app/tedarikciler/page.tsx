"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Phone, Mail, Truck, Pencil, Trash2, Download, Upload, Search, X } from "lucide-react";
import * as XLSX from "xlsx";

interface Tedarikci {
  id: string; ad: string; telefon: string; email?: string; kategori: string; notlar?: string;
}
type FormState = Omit<Tedarikci, "id">;
const EMPTY: FormState = { ad:"", telefon:"", email:"", kategori:"Bakim", notlar:"" };

const KAT_RENK: Record<string,string> = { Bakim:"bg-blue-100 text-blue-700", Onarim:"bg-orange-100 text-orange-700", Temizlik:"bg-green-100 text-green-700", Diger:"bg-gray-100 text-gray-600" };
const KAT_LABEL: Record<string,string> = { Bakim:"Bakım", Onarim:"Onarım", Temizlik:"Temizlik", Diger:"Diğer" };

function TModal({ initial, onClose, onSaved }: { initial?: Tedarikci; onClose:()=>void; onSaved:()=>void }) {
  const [form, setForm] = useState<FormState>(initial ? {...initial} : EMPTY);
  const [hata, setHata] = useState("");
  const f = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => setForm(p=>({...p,[k]:e.target.value}));
  const save = async () => {
    if (!form.ad || !form.telefon) { setHata("Ad ve telefon zorunludur."); return; }
    const url = initial ? `/api/tedarikciler/${initial.id}` : "/api/tedarikciler";
    const res = await fetch(url, { method: initial?"PUT":"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    if (res.ok) { onSaved(); onClose(); } else setHata("Hata oluştu");
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{initial?"Tedarikçi Düzenle":"Yeni Tedarikçi"}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div><label className="text-xs text-gray-500">Ad / Firma</label><input value={form.ad} onChange={f("ad")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Telefon</label><input value={form.telefon} onChange={f("telefon")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">Kategori</label>
              <select value={form.kategori} onChange={f("kategori")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                <option value="Bakim">Bakım</option><option value="Onarim">Onarım</option><option value="Temizlik">Temizlik</option><option value="Diger">Diğer</option>
              </select>
            </div>
          </div>
          <div><label className="text-xs text-gray-500">E-posta</label><input value={form.email??""} onChange={f("email")} type="email" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">Notlar</label><textarea value={form.notlar??""} onChange={f("notlar")} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          {hata && <p className="text-red-600 text-xs bg-red-50 rounded px-3 py-2">{hata}</p>}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={save} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700">Kaydet</button>
        </div>
      </div>
    </div>
  );
}

export default function TedarikcilerPage() {
  const [tedarikciler, setTedarikciler] = useState<Tedarikci[]>([]);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<Tedarikci|undefined>();
  const [silOnay, setSilOnay] = useState<string|null>(null);
  const [arama, setArama] = useState("");
  const [katFiltre, setKatFiltre] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => fetch("/api/tedarikciler").then(r=>r.json()).then(setTedarikciler), []);
  useEffect(()=>{load();}, [load]);

  const sil = async (id: string) => { await fetch(`/api/tedarikciler/${id}`, {method:"DELETE"}); setSilOnay(null); load(); };

  const exportExcel = () => {
    const rows = gosterilen.map(t => ({ "Ad/Firma": t.ad, "Telefon": t.telefon, "E-posta": t.email??"", "Kategori": KAT_LABEL[t.kategori]??t.kategori, "Notlar": t.notlar??"" }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tedarikçiler");
    XLSX.writeFile(wb, `UNIGARDEN_Tedarikciler_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const gosterilen = tedarikciler.filter(t => {
    const q = arama.toLowerCase();
    if (q && !t.ad.toLowerCase().includes(q) && !t.telefon.includes(q)) return false;
    if (katFiltre && t.kategori !== katFiltre) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={arama} onChange={e=>setArama(e.target.value)} placeholder="Ad veya telefon ara..." className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" />
        </div>
        <select value={katFiltre} onChange={e=>setKatFiltre(e.target.value)} className="border rounded-lg px-3 py-2 text-sm text-gray-600">
          <option value="">Tüm Kategoriler</option>
          {Object.entries(KAT_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={exportExcel} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"><Download size={15}/> Excel İndir</button>
        <button onClick={()=>fileRef.current?.click()} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"><Upload size={15}/> Excel Yükle</button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={async e=>{
          const file=e.target.files?.[0]; if(!file)return;
          const buf=await file.arrayBuffer(); const wb=XLSX.read(buf);
          const rows=XLSX.utils.sheet_to_json<Record<string,string>>(wb.Sheets[wb.SheetNames[0]]);
          for(const r of rows) await fetch("/api/tedarikciler",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ad:r["Ad/Firma"]??"",telefon:r["Telefon"]??"",email:r["E-posta"],kategori:"Diger",notlar:r["Notlar"]})});
          load(); e.target.value="";
        }} />
        <button onClick={()=>{setEditItem(undefined);setModal(true);}} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"><Plus size={16}/> Yeni Tedarikçi</button>
      </div>
      <p className="text-xs text-gray-400">{gosterilen.length} / {tedarikciler.length} tedarikçi</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Ad / Firma</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Kategori</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Telefon</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">E-posta</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Notlar</th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {gosterilen.map(t=>(
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3"><div className="flex items-center gap-2"><Truck size={14} className="text-gray-400"/><span className="font-medium text-gray-800">{t.ad}</span></div></td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${KAT_RENK[t.kategori]??"bg-gray-100 text-gray-600"}`}>{KAT_LABEL[t.kategori]??t.kategori}</span></td>
                <td className="px-4 py-3 text-gray-500"><Phone size={12} className="inline mr-1"/>{t.telefon}</td>
                <td className="px-4 py-3 text-gray-500">{t.email?<><Mail size={12} className="inline mr-1"/>{t.email}</>:<span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{t.notlar??"-"}</td>
                <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                  <button onClick={()=>{setEditItem(t);setModal(true);}} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Pencil size={14}/></button>
                  <button onClick={()=>setSilOnay(t.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14}/></button>
                </div></td>
              </tr>
            ))}
            {gosterilen.length===0&&<tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Kayıt bulunamadı</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && <TModal initial={editItem} onClose={()=>setModal(false)} onSaved={load} />}
      {silOnay&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <p className="text-gray-700 mb-4">Bu tedarikçiyi silmek istediğinize emin misiniz?</p>
            <div className="flex gap-3">
              <button onClick={()=>setSilOnay(null)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
              <button onClick={()=>sil(silOnay)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700">Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
