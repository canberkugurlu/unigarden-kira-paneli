"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, User, Building2, Phone, Mail, Pencil, Trash2, Download, Search, X, KeyRound, ChevronDown, ChevronUp, Calendar, Coins, History } from "lucide-react";
import * as XLSX from "xlsx";

interface Konut {
  id: string; daireNo: string; blok: string; katNo: number; tip: string; durum: string; etap: number;
}
interface SahiplikKaydi {
  id: string;
  alisTarihi: string;
  satisTarihi?: string | null;
  alisFiyati?: number | null;
  satisFiyati?: number | null;
  ipotekli?: boolean;
  pay?: number | null;
  payda?: number | null;
  notlar?: string | null;
  konut: { id: string; daireNo: string; blok: string; etap: number };
}
interface DaireSahibi {
  id: string; ad: string; soyad: string; tcKimlik?: string | null; telefon: string; email?: string; notlar?: string;
  tip?: "Bireysel" | "Kurumsal";
  vergiNo?: string | null; unvan?: string | null;
  konutlar: Konut[];
  sahiplikler?: SahiplikKaydi[];
}
type FormState = {
  tip: "Bireysel" | "Kurumsal";
  ad: string; soyad: string; tcKimlik: string;
  vergiNo: string; unvan: string;
  telefon: string; email: string; notlar: string;
};
const EMPTY: FormState = { tip: "Bireysel", ad: "", soyad: "", tcKimlik: "", vergiNo: "", unvan: "", telefon: "", email: "", notlar: "" };

// ── Sahiplik (Alış/Satış) Modal ────────────────────────────────────────────
type SahFormState = { konutId: string; alisTarihi: string; satisTarihi: string; alisFiyati: string; satisFiyati: string; ipotekli: boolean; pay: string; payda: string; notlar: string };
const EMPTY_SAH: SahFormState = { konutId: "", alisTarihi: "", satisTarihi: "", alisFiyati: "", satisFiyati: "", ipotekli: false, pay: "", payda: "", notlar: "" };

function SahiplikModal({ sahibiId, edit, onClose, onSaved }: {
  sahibiId: string;
  edit?: SahiplikKaydi;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<SahFormState>(edit
    ? {
        konutId: edit.konut.id,
        alisTarihi:  edit.alisTarihi  ? edit.alisTarihi.slice(0, 10) : "",
        satisTarihi: edit.satisTarihi ? edit.satisTarihi.slice(0, 10) : "",
        alisFiyati:  edit.alisFiyati  != null ? String(edit.alisFiyati)  : "",
        satisFiyati: edit.satisFiyati != null ? String(edit.satisFiyati) : "",
        ipotekli:    edit.ipotekli ?? false,
        pay:         edit.pay   != null ? String(edit.pay)   : "",
        payda:       edit.payda != null ? String(edit.payda) : "",
        notlar: edit.notlar ?? "",
      }
    : EMPTY_SAH
  );
  const [konutlar, setKonutlar] = useState<Konut[]>([]);
  const [konutQ, setKonutQ]     = useState("");
  const [hata, setHata]         = useState("");
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (edit) return;
    fetch("/api/konutlar").then(r => r.ok ? r.json() : []).then((d: Konut[]) => setKonutlar(Array.isArray(d) ? d : []));
  }, [edit]);

  const set = <K extends keyof SahFormState>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const kaydet = async () => {
    setHata("");
    if (!edit && !form.konutId) { setHata("Daire seçmelisiniz."); return; }
    if (!form.alisTarihi)       { setHata("Alış tarihi zorunludur."); return; }
    setSaving(true);
    const url    = edit ? `/api/daire-sahipligi/${edit.id}` : `/api/daire-sahipligi`;
    const method = edit ? "PATCH" : "POST";
    const common = {
      alisTarihi:  form.alisTarihi,
      satisTarihi: form.satisTarihi || null,
      alisFiyati:  form.alisFiyati  === "" ? null : Number(form.alisFiyati),
      satisFiyati: form.satisFiyati === "" ? null : Number(form.satisFiyati),
      ipotekli:    form.ipotekli,
      pay:   form.pay   === "" ? null : Number(form.pay),
      payda: form.payda === "" ? null : Number(form.payda),
      notlar: form.notlar || null,
    };
    const body   = edit ? common : { ...common, konutId: form.konutId, daireSahibiId: sahibiId };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const j = await res.json().catch(() => ({})); setHata(j.error ?? "Hata oluştu"); }
  };

  const filtreliKonutlar = konutlar.filter(k => {
    if (!konutQ) return true;
    const q = konutQ.toLowerCase();
    return k.daireNo.toLowerCase().includes(q) || k.blok.toLowerCase().includes(q);
  }).slice(0, 100);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{edit ? "Sahiplik Kaydını Düzenle" : "Yeni Alış Kaydı"}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          {!edit && (
            <div>
              <label className="text-xs text-gray-500">Daire</label>
              <input value={konutQ} onChange={e => setKonutQ(e.target.value)} placeholder="Daire no ile ara..." className="w-full border rounded-lg px-3 py-2 text-sm mt-1 mb-1" />
              <select value={form.konutId} onChange={set("konutId")} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">— Daire seç —</option>
                {filtreliKonutlar.map(k => (
                  <option key={k.id} value={k.id}>{k.daireNo} • {k.blok} Blok • {k.etap}. Etap</option>
                ))}
              </select>
            </div>
          )}
          {edit && (
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">
              Daire: <span className="font-semibold text-gray-800">{edit.konut.daireNo}</span> • {edit.konut.blok} Blok • {edit.konut.etap}. Etap
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Alış Tarihi</label>
              <input type="date" value={form.alisTarihi} onChange={set("alisTarihi")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Satış Tarihi (opsiyonel)</label>
              <input type="date" value={form.satisTarihi} onChange={set("satisTarihi")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Alış Fiyatı (₺)</label>
              <input type="number" value={form.alisFiyati} onChange={set("alisFiyati")} placeholder="0" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Satış Fiyatı (₺)</label>
              <input type="number" value={form.satisFiyati} onChange={set("satisFiyati")} placeholder="0" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-xs text-gray-500">Pay</label>
              <input type="number" value={form.pay} onChange={set("pay")} placeholder="1" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Payda</label>
              <input type="number" value={form.payda} onChange={set("payda")} placeholder="1" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <label className="flex items-center gap-2 text-sm pb-2">
              <input type="checkbox" checked={form.ipotekli} onChange={(e) => setForm(p => ({ ...p, ipotekli: e.target.checked }))} />
              İpotekli
            </label>
          </div>
          <div>
            <label className="text-xs text-gray-500">Notlar (opsiyonel)</label>
            <textarea value={form.notlar} onChange={set("notlar")} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
          {hata && <p className="text-red-600 text-xs bg-red-50 rounded px-3 py-2">{hata}</p>}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={kaydet} disabled={saving} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sahiplik Geçmişi Bölümü ────────────────────────────────────────────────
function SahiplikGecmisi({ sahibi, onChanged }: { sahibi: DaireSahibi; onChanged: () => void }) {
  const [acik, setAcik] = useState(false);
  const [modal, setModal] = useState<{ yeni?: boolean; edit?: SahiplikKaydi } | null>(null);
  const [silOnay, setSilOnay] = useState<string | null>(null);
  const kayitlar = sahibi.sahiplikler ?? [];
  const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString("tr-TR") : "—";
  const para = (n?: number | null) => n != null ? `₺${n.toLocaleString("tr-TR")}` : "—";

  const sil = async (id: string) => {
    await fetch(`/api/daire-sahipligi/${id}`, { method: "DELETE" });
    setSilOnay(null); onChanged();
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button onClick={() => setAcik(a => !a)} className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-gray-700">
        <span className="flex items-center gap-1.5"><History size={12} /> Sahiplik Geçmişi ({kayitlar.length})</span>
        {acik ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {acik && (
        <div className="mt-2 space-y-2">
          {kayitlar.length === 0 && <p className="text-xs text-gray-300 italic">Henüz sahiplik kaydı yok.</p>}
          {kayitlar.map(k => (
            <div key={k.id} className="bg-gray-50 rounded-lg px-3 py-2 text-xs flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800">{k.konut.daireNo}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{k.konut.blok} Blok · {k.konut.etap}. Etap</span>
                  {k.satisTarihi
                    ? <span className="px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">Satıldı</span>
                    : <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Aktif</span>}
                  {k.ipotekli && <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">İpotekli</span>}
                  {k.pay && k.payda && k.payda > 1 && <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">{k.pay}/{k.payda} Hisse</span>}
                </div>
                <div className="text-gray-500 mt-0.5 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1"><Calendar size={10} /> {fmt(k.alisTarihi)} → {fmt(k.satisTarihi)}</span>
                  <span className="flex items-center gap-1"><Coins size={10} /> {para(k.alisFiyati)} / {para(k.satisFiyati)}</span>
                </div>
                {k.notlar && <p className="text-gray-400 mt-0.5 truncate">{k.notlar}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setModal({ edit: k })} title="Düzenle" className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700"><Pencil size={11} /></button>
                <button onClick={() => setSilOnay(k.id)}    title="Sil"      className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"><Trash2 size={11} /></button>
              </div>
            </div>
          ))}
          <button onClick={() => setModal({ yeni: true })} className="w-full text-xs text-emerald-600 hover:bg-emerald-50 border border-dashed border-emerald-200 rounded-lg py-1.5 flex items-center justify-center gap-1">
            <Plus size={12} /> Yeni Alış / Satış Kaydı
          </button>
        </div>
      )}
      {modal && <SahiplikModal sahibiId={sahibi.id} edit={modal.edit} onClose={() => setModal(null)} onSaved={onChanged} />}
      {silOnay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <p className="text-gray-700 mb-4">Bu sahiplik kaydını silmek istediğinizden emin misiniz?</p>
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

function SifreModal({ sahibiId, onClose }: { sahibiId: string; onClose: () => void }) {
  const [sifre, setSifre] = useState("");
  const [tekrar, setTekrar] = useState("");
  const [durum, setDurum] = useState<"idle" | "ok" | "hata">("idle");
  const [mesaj, setMesaj] = useState("");

  const kaydet = async () => {
    if (sifre.length < 6) { setDurum("hata"); setMesaj("En az 6 karakter giriniz."); return; }
    if (sifre !== tekrar) { setDurum("hata"); setMesaj("Şifreler eşleşmiyor."); return; }
    const res = await fetch("/api/ev-sahipleri/sifre", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ evSahibiId: sahibiId, sifre }) });
    if (res.ok) { setDurum("ok"); setMesaj("Şifre başarıyla kaydedildi."); setTimeout(onClose, 1200); }
    else { const j = await res.json(); setDurum("hata"); setMesaj(j.error ?? "Hata oluştu"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Ev Sahibi Şifre Belirle</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Yeni Şifre (min. 6 karakter)</label>
            <input type="password" value={sifre} onChange={e => setSifre(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Şifre Tekrar</label>
            <input type="password" value={tekrar} onChange={e => setTekrar(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
          {durum === "hata" && <p className="text-red-600 text-xs bg-red-50 rounded px-3 py-2">{mesaj}</p>}
          {durum === "ok" && <p className="text-green-600 text-xs bg-green-50 rounded px-3 py-2">{mesaj}</p>}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={kaydet} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700">Kaydet</button>
        </div>
      </div>
    </div>
  );
}

const durumRenk: Record<string, string> = {
  Dolu: "bg-red-100 text-red-700",
  Bos: "bg-green-100 text-green-700",
  Bakimda: "bg-yellow-100 text-yellow-700",
};

function SahibiModal({ initial, onClose, onSaved }: { initial?: DaireSahibi; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<FormState>(initial ? {
    tip: (initial.tip ?? "Bireysel") as "Bireysel" | "Kurumsal",
    ad: initial.ad, soyad: initial.soyad,
    tcKimlik: initial.tcKimlik ?? "",
    vergiNo: initial.vergiNo ?? "", unvan: initial.unvan ?? "",
    telefon: initial.telefon, email: initial.email ?? "", notlar: initial.notlar ?? ""
  } : EMPTY);
  const [hata, setHata] = useState("");
  const [saving, setSaving] = useState(false);
  const f = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    if (form.tip === "Bireysel") {
      if (!form.ad || !form.soyad || !form.telefon) {
        setHata("Ad, soyad ve telefon zorunludur."); return;
      }
      if (form.tcKimlik && form.tcKimlik.length !== 11) {
        setHata("TC Kimlik 11 haneli olmalı."); return;
      }
    } else {
      if (!form.unvan) { setHata("Unvan zorunludur."); return; }
    }
    setSaving(true); setHata("");
    const url = initial ? `/api/daire-sahipleri/${initial.id}` : "/api/daire-sahipleri";
    // API payload
    const payload: Record<string, unknown> = {
      tip: form.tip,
      ad: form.tip === "Kurumsal" ? (form.unvan || "Kurum") : form.ad,
      soyad: form.tip === "Kurumsal" ? "-" : form.soyad,
      telefon: form.telefon,
      email: form.email || null,
      notlar: form.notlar || null,
      tcKimlik: form.tip === "Bireysel" && form.tcKimlik ? form.tcKimlik : null,
      vergiNo:  form.tip === "Kurumsal" && form.vergiNo ? form.vergiNo : null,
      unvan:    form.tip === "Kurumsal" ? (form.unvan || null) : null,
    };
    const res = await fetch(url, { method: initial ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); } else { const j = await res.json(); setHata(j.error ?? "Hata oluştu"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{initial ? "Daire Sahibi Düzenle" : "Yeni Daire Sahibi"}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        {/* Tip seçici */}
        <div className="flex gap-2 mb-4 bg-gray-50 rounded-lg p-1">
          <button onClick={() => setForm(p => ({ ...p, tip: "Bireysel" }))}
            className={`flex-1 py-2 text-xs rounded font-medium transition-colors ${form.tip === "Bireysel" ? "bg-white shadow text-emerald-700" : "text-gray-500"}`}>
            👤 Bireysel
          </button>
          <button onClick={() => setForm(p => ({ ...p, tip: "Kurumsal" }))}
            className={`flex-1 py-2 text-xs rounded font-medium transition-colors ${form.tip === "Kurumsal" ? "bg-white shadow text-blue-700" : "text-gray-500"}`}>
            🏢 Kurumsal
          </button>
        </div>
        <div className="space-y-3">
          {form.tip === "Bireysel" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Ad</label><input value={form.ad} onChange={f("ad")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
                <div><label className="text-xs text-gray-500">Soyad</label><input value={form.soyad} onChange={f("soyad")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
              </div>
              <div><label className="text-xs text-gray-500">TC Kimlik No (opsiyonel)</label><input value={form.tcKimlik} onChange={f("tcKimlik")} maxLength={11} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Yabancı uyruklu ise boş bırakın" /></div>
            </>
          ) : (
            <>
              <div><label className="text-xs text-gray-500">Firma Unvanı</label><input value={form.unvan} onChange={f("unvan")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500">Vergi No</label><input value={form.vergiNo} onChange={f("vergiNo")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            </>
          )}
          <div><label className="text-xs text-gray-500">Telefon</label><input value={form.telefon} onChange={f("telefon")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="05xx xxx xx xx" /></div>
          <div><label className="text-xs text-gray-500">E-posta (opsiyonel)</label><input value={form.email} onChange={f("email")} type="email" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">Notlar (opsiyonel)</label><textarea value={form.notlar} onChange={f("notlar")} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          {hata && <p className="text-red-600 text-xs bg-red-50 rounded px-3 py-2">{hata}</p>}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={save} disabled={saving} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DaireSahipleriPage() {
  const [sahipler, setSahipler] = useState<DaireSahibi[]>([]);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<DaireSahibi | undefined>();
  const [silOnay, setSilOnay] = useState<string | null>(null);
  const [sifreModal, setSifreModal] = useState<string | null>(null);
  const [arama, setArama] = useState("");

  const load = useCallback(() => fetch("/api/daire-sahipleri").then(r => r.json()).then(setSahipler), []);
  useEffect(() => { load(); }, [load]);

  const sil = async (id: string) => {
    await fetch(`/api/daire-sahipleri/${id}`, { method: "DELETE" });
    setSilOnay(null); load();
  };

  const gosterilen = sahipler.filter(s => {
    const q = arama.toLowerCase();
    if (!q) return true;
    return `${s.ad} ${s.soyad}`.toLowerCase().includes(q) || (s.tcKimlik ?? "").includes(q) || (s.vergiNo ?? "").includes(q) || (s.unvan ?? "").toLowerCase().includes(q) || s.telefon.includes(q);
  });

  const exportExcel = () => {
    const rows = gosterilen.map(s => ({
      "Tip": s.tip ?? "Bireysel",
      "Ad": s.ad, "Soyad": s.soyad, "TC Kimlik": s.tcKimlik ?? "",
      "Vergi No": s.vergiNo ?? "", "Unvan": s.unvan ?? "",
      "Telefon": s.telefon, "E-posta": s.email ?? "",
      "Daire Sayısı": s.konutlar.length,
      "Daireler": s.konutlar.map(k => k.daireNo).join(", "),
      "Notlar": s.notlar ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daire Sahipleri");
    XLSX.writeFile(wb, `UNIGARDEN_DaireSahipleri_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={arama} onChange={e => setArama(e.target.value)} placeholder="Ad, TC veya telefon ara..."
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" />
        </div>
        <button onClick={exportExcel} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"><Download size={15} /> Excel İndir</button>
        <button onClick={() => { setEditItem(undefined); setModal(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
          <Plus size={16} /> Yeni Daire Sahibi
        </button>
      </div>

      <p className="text-xs text-gray-400">{gosterilen.length} / {sahipler.length} daire sahibi</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {gosterilen.map(s => (
          <div key={s.id} className={`bg-white rounded-xl p-5 shadow-sm border ${s.tip === "Kurumsal" ? "border-blue-200" : "border-gray-100"}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${s.tip === "Kurumsal" ? "bg-blue-100" : "bg-emerald-100"} rounded-full flex items-center justify-center`}>
                  {s.tip === "Kurumsal"
                    ? <Building2 size={20} className="text-blue-600" />
                    : <User size={20} className="text-emerald-600" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-semibold text-gray-800">
                      {s.tip === "Kurumsal" ? (s.unvan ?? s.ad) : `${s.ad} ${s.soyad}`}
                    </h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${s.tip === "Kurumsal" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>
                      {s.tip === "Kurumsal" ? "Kurumsal" : "Bireysel"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {s.tip === "Kurumsal" && s.vergiNo ? `VNO: ${s.vergiNo}` : s.tcKimlik ? `TC: ${s.tcKimlik}` : "Kimlik bilgisi yok"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setSifreModal(s.id)} title="Şifre Belirle" className="p-1.5 rounded hover:bg-emerald-50 text-gray-400 hover:text-emerald-600"><KeyRound size={14} /></button>
                <button onClick={() => { setEditItem(s); setModal(true); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Pencil size={14} /></button>
                <button onClick={() => setSilOnay(s.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>

            <div className="text-sm text-gray-500 space-y-1 mb-3">
              <p className="flex items-center gap-1.5"><Phone size={12} /> {s.telefon}</p>
              {s.email && <p className="flex items-center gap-1.5"><Mail size={12} /> {s.email}</p>}
            </div>

            {s.konutlar.length > 0 ? (
              <div>
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <Building2 size={11} /> {s.konutlar.length} daire
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {s.konutlar.map(k => (
                    <span key={k.id} className={`text-xs px-2 py-0.5 rounded-full ${durumRenk[k.durum] ?? "bg-gray-100 text-gray-600"}`}>
                      {k.daireNo} • {k.etap}. Etap
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-300 italic">Henüz daire atanmamış</p>
            )}

            <SahiplikGecmisi sahibi={s} onChanged={load} />
          </div>
        ))}
      </div>

      {gosterilen.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p>{arama ? "Arama sonucu bulunamadı" : "Henüz daire sahibi kaydı yok"}</p>
        </div>
      )}

      {modal && <SahibiModal initial={editItem} onClose={() => { setModal(false); setEditItem(undefined); }} onSaved={load} />}
      {sifreModal && <SifreModal sahibiId={sifreModal} onClose={() => setSifreModal(null)} />}

      {silOnay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <p className="text-gray-700 mb-4">Bu daire sahibini silmek istediğinizden emin misiniz?</p>
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
