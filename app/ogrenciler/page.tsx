"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, User, Phone, Mail, GraduationCap, Pencil, Trash2,
  Download, Upload, Search, X, KeyRound, FileImage, AlertCircle, Eye, Trash,
} from "lucide-react";
import * as XLSX from "xlsx";

interface Konut { id: string; blok: string; daireNo: string; etap: number; tip: string }
interface AktifSoz {
  id: string; konutId?: string; oda?: string | null; aylikKira: number;
  baslangicTarihi?: string; bitisTarihi?: string; konut: Konut;
}
interface Ogrenci {
  id: string; ad: string; soyad: string; tcKimlik: string;
  ogrenciNo?: string; universite?: string; bolum?: string;
  telefon: string; email: string; acilKisi?: string; acilTelefon?: string;
  notlar?: string; cinsiyet?: string;
  kimlikBelgesi?: string; ogrenciBelgesi?: string;
  sozlesmeler?: AktifSoz[];
}

type FormState = Omit<Ogrenci, "id" | "kimlikBelgesi" | "ogrenciBelgesi">;
const EMPTY: FormState = {
  ad: "", soyad: "", tcKimlik: "", ogrenciNo: "", universite: "",
  bolum: "", telefon: "", email: "", acilKisi: "", acilTelefon: "",
  notlar: "", cinsiyet: "",
};

/* ── Kayıt/Düzenleme Modalı ── */
function OgrenciModal({ initial, onClose, onSaved }: { initial?: Ogrenci; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<FormState>(
    initial ? {
      ad: initial.ad, soyad: initial.soyad, tcKimlik: initial.tcKimlik,
      ogrenciNo: initial.ogrenciNo ?? "", universite: initial.universite ?? "",
      bolum: initial.bolum ?? "", telefon: initial.telefon, email: initial.email,
      acilKisi: initial.acilKisi ?? "", acilTelefon: initial.acilTelefon ?? "",
      notlar: initial.notlar ?? "", cinsiyet: initial.cinsiyet ?? "",
    } : EMPTY
  );
  const [hata, setHata] = useState("");
  const [saving, setSaving] = useState(false);

  // Daire atama state
  const [konutlar, setKonutlar]     = useState<Konut[]>([]);
  const [aktifSozler, setAktifSozler] = useState<AktifSoz[]>([]);
  const [daireForm, setDaireForm]   = useState({ konutId: "", odaSecim: "oda1", aylikKira: "", aylikKira2: "" });
  const [daireHata, setDaireHata]   = useState("");
  const [daireKayit, setDaireKayit] = useState(false);

  useEffect(() => {
    fetch("/api/konutlar").then(r => r.json()).then((data: Konut[]) => setKonutlar(data));
    if (initial) {
      fetch(`/api/ogrenciler/${initial.id}/sozlesme`)
        .then(r => r.ok ? r.json() : [])
        .then((arr: AktifSoz[]) => {
          if (arr?.length) {
            setAktifSozler(arr);
            setDaireForm(p => ({ ...p, konutId: arr[0].konutId ?? "", aylikKira: String(arr[0].aylikKira) }));
          }
        });
    }
  }, [initial]);

  const secilenKonut = konutlar.find(k => k.id === daireForm.konutId);
  const is2Etap = secilenKonut?.etap === 2;

  // "tumDaire" = both rooms, "oda1" = Oda 1 only, "oda2" = Oda 2 only
  const kaydetDaire = async () => {
    if (!daireForm.konutId) { setDaireHata("Daire seçiniz."); return; }
    setDaireKayit(true); setDaireHata("");
    const bugun = new Date().toISOString().slice(0, 10);
    const bitisSon = new Date(); bitisSon.setFullYear(bitisSon.getFullYear() + 1);
    const bit = bitisSon.toISOString().slice(0, 10);

    const base = {
      konutId: daireForm.konutId,
      ogrenciId: initial!.id,
      depozito: 0,
      kiraOdemGunu: 1,
      baslangicTarihi: bugun,
      bitisTarihi: bit,
    };

    const odalar: Array<{ oda: string | null; kira: number }> =
      !is2Etap
        ? [{ oda: null, kira: Number(daireForm.aylikKira) || 0 }]
        : daireForm.odaSecim === "tumDaire"
          ? [
              { oda: "Oda 1", kira: Number(daireForm.aylikKira) || 0 },
              { oda: "Oda 2", kira: Number(daireForm.aylikKira2) || 0 },
            ]
          : daireForm.odaSecim === "oda1"
            ? [{ oda: "Oda 1", kira: Number(daireForm.aylikKira) || 0 }]
            : [{ oda: "Oda 2", kira: Number(daireForm.aylikKira) || 0 }];

    let hataMsg = "";
    const yeniSozler: AktifSoz[] = [];
    for (const { oda, kira } of odalar) {
      const res = await fetch("/api/sozlesmeler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...base, oda, aylikKira: kira }),
      });
      if (res.ok) {
        const s = await res.json();
        yeniSozler.push({ id: s.id, konutId: s.konutId, oda: s.oda, aylikKira: s.aylikKira, konut: s.konut });
      } else {
        const j = await res.json();
        hataMsg = j.error ?? "Hata oluştu";
      }
    }
    setDaireKayit(false);
    if (yeniSozler.length) setAktifSozler(prev => [...prev.filter(s => !yeniSozler.find(n => n.konutId === s.konutId && n.oda === s.oda)), ...yeniSozler]);
    if (hataMsg) setDaireHata(hataMsg);
  };

  const f = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    if (!form.ad || !form.soyad || form.tcKimlik.length !== 11 || !form.telefon || !form.email) {
      setHata("Ad, soyad, 11 haneli TC, telefon ve e-posta zorunludur."); return;
    }
    setSaving(true); setHata("");
    const url = initial ? `/api/ogrenciler/${initial.id}` : "/api/ogrenciler";
    const method = initial ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); } else { const j = await res.json(); setHata(j.error ?? "Hata"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">{initial ? "Kiracı Düzenle" : "Yeni Kiracı"}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Ad</label><input value={form.ad} onChange={f("ad")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">Soyad</label><input value={form.soyad} onChange={f("soyad")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">TC Kimlik No</label>
              <input value={form.tcKimlik} onChange={f("tcKimlik")} maxLength={11} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Cinsiyet</label>
              <select value={form.cinsiyet ?? ""} onChange={f("cinsiyet")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                <option value="">Belirtilmemiş</option>
                <option value="Erkek">Erkek</option>
                <option value="Kadın">Kadın</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Telefon</label><input value={form.telefon} onChange={f("telefon")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">E-posta</label><input value={form.email} onChange={f("email")} type="email" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Öğrenci No</label><input value={form.ogrenciNo ?? ""} onChange={f("ogrenciNo")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">Üniversite</label><input value={form.universite ?? ""} onChange={f("universite")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Bölüm</label><input value={form.bolum ?? ""} onChange={f("bolum")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">Acil Kişi</label><input value={form.acilKisi ?? ""} onChange={f("acilKisi")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          </div>
          <div><label className="text-xs text-gray-500">Acil Telefon</label><input value={form.acilTelefon ?? ""} onChange={f("acilTelefon")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          <div><label className="text-xs text-gray-500">Notlar</label><textarea value={form.notlar ?? ""} onChange={f("notlar")} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          {hata && <p className="text-red-600 text-xs bg-red-50 rounded px-3 py-2">{hata}</p>}

          {/* ── Daire Ataması (sadece düzenleme modunda) ── */}
          {initial && (
            <div className="border-t border-gray-100 pt-3 mt-1">
              <p className="text-xs font-semibold text-gray-600 mb-2">Daire Ataması</p>

              {/* Mevcut aktif sözleşmeler */}
              {aktifSozler.length > 0 && (
                <div className="mb-2 space-y-1">
                  {aktifSozler.map(s => (
                    <div key={s.id} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg flex items-center justify-between">
                      <span>
                        <strong>{s.konut.daireNo}</strong>
                        {s.oda && <> / <strong>{s.oda}</strong></>}
                      </span>
                      {s.aylikKira > 0 && <span className="font-medium">{s.aylikKira.toLocaleString("tr-TR")} ₺</span>}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {/* Daire seç */}
                <div>
                  <label className="text-xs text-gray-500">Daire Seç</label>
                  <select
                    value={daireForm.konutId}
                    onChange={e => setDaireForm(p => ({ ...p, konutId: e.target.value, odaSecim: "oda1" }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  >
                    <option value="">— Daire seçin —</option>
                    {konutlar.map(k => (
                      <option key={k.id} value={k.id}>
                        {k.daireNo} ({k.tip}) — {k.etap}. Etap
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Etap: oda seçim butonları */}
                {is2Etap && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Oda Seçimi</label>
                    <div className="flex gap-2">
                      {[
                        { val: "oda1",     label: "Oda 1" },
                        { val: "oda2",     label: "Oda 2" },
                        { val: "tumDaire", label: "Tüm Daire (her iki oda)" },
                      ].map(({ val, label }) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setDaireForm(p => ({ ...p, odaSecim: val }))}
                          className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${
                            daireForm.odaSecim === val
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kira alanları */}
                {is2Etap && daireForm.odaSecim === "tumDaire" ? (
                  <div>
                    <label className="text-xs text-gray-500">Toplam Kira (₺) <span className="text-gray-400">(her odaya eşit bölünür)</span></label>
                    <input type="number" value={daireForm.aylikKira}
                      onChange={e => setDaireForm(p => ({ ...p, aylikKira: e.target.value, aylikKira2: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="0" />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-gray-500">Aylık Kira (₺)</label>
                    <input type="number" value={daireForm.aylikKira}
                      onChange={e => setDaireForm(p => ({ ...p, aylikKira: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="0" />
                  </div>
                )}

                {daireHata && <p className="text-red-600 text-xs bg-red-50 rounded px-3 py-2">{daireHata}</p>}
                <button
                  onClick={kaydetDaire}
                  disabled={daireKayit || !daireForm.konutId}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {daireKayit ? "Atanıyor..." : aktifSozler.length ? "Daireye Ekle" : "Daireye Ata"}
                </button>
              </div>
            </div>
          )}
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

/* ── Şifre Modalı ── */
function SifreModal({ ogrenci, onClose }: { ogrenci: Ogrenci; onClose: () => void }) {
  const [sifre, setSifre] = useState("");
  const [saving, setSaving] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const save = async () => {
    if (sifre.length < 6) { setMesaj("En az 6 karakter olmalı."); return; }
    setSaving(true);
    const res = await fetch("/api/ogrenciler/sifre", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ogrenciId: ogrenci.id, sifre }) });
    setSaving(false);
    if (res.ok) { setMesaj("Şifre başarıyla belirlendi!"); setTimeout(onClose, 1200); }
    else setMesaj("Hata oluştu.");
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Şifre Belirle</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-3">{ogrenci.ad} {ogrenci.soyad} — <span className="font-mono text-xs">{ogrenci.email}</span></p>
        <input type="password" value={sifre} onChange={e => setSifre(e.target.value)} placeholder="Yeni şifre (min. 6 karakter)" className="w-full border rounded-lg px-3 py-2 text-sm" />
        {mesaj && <p className={`text-xs mt-2 ${mesaj.includes("başarı") ? "text-green-600" : "text-red-600"}`}>{mesaj}</p>}
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={save} disabled={saving} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60">{saving ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Evrak Modalı ── */
function EvrakModal({ ogrenci, onClose, onSaved }: { ogrenci: Ogrenci; onClose: () => void; onSaved: (updated: Ogrenci) => void }) {
  const kimlikRef = useRef<HTMLInputElement>(null);
  const ogrenciRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"kimlik" | "ogrenci" | null>(null);
  const [onizleme, setOnizleme] = useState<{ url: string; tip: string } | null>(null);
  const [hata, setHata] = useState("");

  const yukle = async (tip: "kimlik" | "ogrenci", dosya: File) => {
    setHata("");
    const ext = dosya.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["jpg", "jpeg"].includes(ext)) {
      setHata("Sadece JPEG (.jpg) dosya yüklenebilir."); return;
    }
    setUploading(tip);
    const fd = new FormData();
    fd.append("dosya", dosya);
    fd.append("tip", tip);
    const res = await fetch(`/api/ogrenciler/${ogrenci.id}/belge`, { method: "POST", body: fd });
    setUploading(null);
    if (res.ok) { const updated = await res.json(); onSaved(updated); }
    else { const j = await res.json(); setHata(j.error ?? "Yükleme başarısız"); }
  };

  const sil = async (tip: "kimlik" | "ogrenci") => {
    const res = await fetch(`/api/ogrenciler/${ogrenci.id}/belge`, {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tip }),
    });
    if (res.ok) { const updated = await res.json(); onSaved(updated); }
  };

  const BelgeKart = ({ tip, label, yol }: { tip: "kimlik" | "ogrenci"; label: string; yol?: string }) => (
    <div className="border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileImage size={16} className={yol ? "text-emerald-600" : "text-red-500"} />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        {!yol && (
          <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            <AlertCircle size={11} /> Evrak Eksik
          </span>
        )}
        {yol && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Yüklendi</span>
        )}
      </div>

      {yol ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-100 bg-gray-50 h-32 flex items-center justify-center cursor-pointer"
          onClick={() => setOnizleme({ url: yol, tip: label })}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={yol} alt={label} className="h-full w-full object-contain" />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <Eye size={20} className="text-white" />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-red-200 bg-red-50 h-24 flex items-center justify-center">
          <p className="text-xs text-red-400">Henüz yüklenmedi</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => (tip === "kimlik" ? kimlikRef : ogrenciRef).current?.click()}
          disabled={uploading === tip}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs border border-gray-200 text-gray-600 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <Upload size={13} /> {uploading === tip ? "Yükleniyor..." : yol ? "Değiştir" : "JPEG Yükle"}
        </button>
        {yol && (
          <button onClick={() => sil(tip)}
            className="p-1.5 text-red-400 hover:text-red-600 border border-red-100 rounded-lg hover:bg-red-50">
            <Trash size={13} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">Evraklar</h3>
            <p className="text-xs text-gray-400">{ogrenci.ad} {ogrenci.soyad}</p>
          </div>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>

        {hata && <p className="text-red-600 text-xs bg-red-50 rounded px-3 py-2 mb-3">{hata}</p>}

        <div className="space-y-3">
          <BelgeKart tip="kimlik" label="Kimlik Belgesi" yol={ogrenci.kimlikBelgesi ?? undefined} />
          <BelgeKart tip="ogrenci" label="Öğrenci Belgesi" yol={ogrenci.ogrenciBelgesi ?? undefined} />
        </div>

        {/* Hidden file inputs */}
        <input ref={kimlikRef} type="file" accept=".jpg,.jpeg,image/jpeg" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) yukle("kimlik", f); e.target.value = ""; }} />
        <input ref={ogrenciRef} type="file" accept=".jpg,.jpeg,image/jpeg" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) yukle("ogrenci", f); e.target.value = ""; }} />

        <button onClick={onClose} className="w-full mt-4 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">Kapat</button>
      </div>

      {/* Önizleme */}
      {onizleme && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]" onClick={() => setOnizleme(null)}>
          <div className="relative max-w-2xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setOnizleme(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300">
              <X size={24} />
            </button>
            <p className="text-white text-sm mb-2 text-center">{onizleme.tip}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={onizleme.url} alt={onizleme.tip} className="rounded-xl max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Evrak Durumu Rozeti (tablo satırı için) ── */
function EvrakDurumu({ kimlik, ogrenci }: { kimlik?: string; ogrenci?: string }) {
  const tamam = !!kimlik && !!ogrenci;
  const hicbiri = !kimlik && !ogrenci;
  if (tamam) return <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Tam</span>;
  if (hicbiri) return (
    <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
      <AlertCircle size={11} /> Evrak Eksik
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
      <AlertCircle size={11} /> Eksik ({!kimlik ? "Kimlik" : "Öğrenci"})
    </span>
  );
}

// ─── Kolon tanımları ─────────────────────────────────────────────────────────
const KOLON_TANIMLARI = [
  { id: "adSoyad",    label: "Ad Soyad",           zorunlu: true },
  { id: "tcNo",       label: "TC / Öğr. No",        zorunlu: false },
  { id: "cinsiyet",   label: "Cinsiyet",             zorunlu: false },
  { id: "telefon",    label: "Telefon / E-posta",    zorunlu: false },
  { id: "universite", label: "Üniversite / Bölüm",   zorunlu: false },
  { id: "blokDaire",  label: "Blok / Daire",         zorunlu: false },
  { id: "oda",        label: "Oda",                  zorunlu: false },
  { id: "kira",       label: "Kira (₺)",             zorunlu: false },
  { id: "bitisT",     label: "Sözleşme Bitiş",       zorunlu: false },
  { id: "evraklar",   label: "Evraklar",             zorunlu: false },
] as const;

type KolonId = typeof KOLON_TANIMLARI[number]["id"];
const VARSAYILAN_KOLONLAR = new Set<KolonId>(
  KOLON_TANIMLARI.map(k => k.id)
);

const CINSIYET_RENK: Record<string, string> = {
  Erkek: "bg-blue-50 text-blue-700",
  Kadın: "bg-pink-50 text-pink-700",
};

/* ── Ana Sayfa ── */
export default function OgrencilerPage() {
  const [ogrenciler, setOgrenciler] = useState<Ogrenci[]>([]);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState<Ogrenci | undefined>();
  const [silOnay, setSilOnay] = useState<string | null>(null);
  const [sifreItem, setSifreItem] = useState<Ogrenci | null>(null);
  const [evrakItem, setEvrakItem] = useState<Ogrenci | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Kolon görünürlüğü
  const [kolonlar, setKolonlar] = useState<Set<KolonId>>(VARSAYILAN_KOLONLAR);
  const [kolonPanelAcik, setKolonPanelAcik] = useState(false);

  // ── Filtreler
  const [arama, setArama]           = useState("");
  const [filtrePanelAcik, setFiltrePanelAcik] = useState(false);
  const [uniFiltre, setUniFiltre]   = useState("");
  const [blokFiltre, setBlokFiltre] = useState("");
  const [cinsFiltre, setCinsFiltre] = useState("");
  const [daireDurum, setDaireDurum] = useState(""); // "atanmis" | "atanmamis"
  const [evrakDurum, setEvrakDurum] = useState(""); // "tam" | "eksik"
  const [bitisFiltre, setBitisFiltre] = useState(""); // "30" | "90" | "gecmis"

  const load = useCallback(() => fetch("/api/ogrenciler").then(r => r.json()).then(setOgrenciler), []);
  useEffect(() => { load(); }, [load]);

  const sil = async (id: string) => {
    await fetch(`/api/ogrenciler/${id}`, { method: "DELETE" });
    setSilOnay(null); load();
  };

  const toggleKolon = (id: KolonId) => {
    setKolonlar(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── Filtre uygulama
  const aktifFiltreAdet = [uniFiltre, blokFiltre, cinsFiltre, daireDurum, evrakDurum, bitisFiltre].filter(Boolean).length;

  const gosterilen = ogrenciler.filter(o => {
    const q = arama.toLowerCase();
    if (q && !`${o.ad} ${o.soyad}`.toLowerCase().includes(q) &&
        !(o.tcKimlik ?? "").includes(q) && !(o.telefon ?? "").includes(q) &&
        !(o.email ?? "").toLowerCase().includes(q)) return false;

    if (uniFiltre && o.universite !== uniFiltre) return false;
    if (cinsFiltre) {
      if (cinsFiltre === "Belirtilmemiş" && o.cinsiyet) return false;
      if (cinsFiltre !== "Belirtilmemiş" && o.cinsiyet !== cinsFiltre) return false;
    }

    const sozler = o.sozlesmeler ?? [];
    if (blokFiltre && !sozler.some(s => s.konut.blok === blokFiltre)) return false;
    if (daireDurum === "atanmis"   && sozler.length === 0) return false;
    if (daireDurum === "atanmamis" && sozler.length > 0)  return false;

    if (evrakDurum === "tam"   && !(o.kimlikBelgesi && o.ogrenciBelgesi)) return false;
    if (evrakDurum === "eksik" && (o.kimlikBelgesi && o.ogrenciBelgesi))  return false;

    if (bitisFiltre && sozler.length > 0) {
      const gun = Math.ceil((new Date(sozler[0].bitisTarihi!).getTime() - Date.now()) / 86400000);
      if (bitisFiltre === "30"    && gun > 30)  return false;
      if (bitisFiltre === "90"    && gun > 90)  return false;
      if (bitisFiltre === "gecmis" && gun >= 0) return false;
    }

    return true;
  });

  const filtreSifirla = () => {
    setUniFiltre(""); setBlokFiltre(""); setCinsFiltre("");
    setDaireDurum(""); setEvrakDurum(""); setBitisFiltre("");
  };

  const uniler = [...new Set(ogrenciler.map(o => o.universite).filter(Boolean))].sort() as string[];
  const bloklar = [...new Set(
    ogrenciler.flatMap(o => (o.sozlesmeler ?? []).map(s => s.konut.blok))
  )].sort();

  const exportExcel = () => {
    const rows = gosterilen.map(o => {
      const sozler = o.sozlesmeler ?? [];
      const konutStr = [...new Set(sozler.map(sz => `${sz.konut.blok} ${sz.konut.daireNo}`))].join(", ");
      const odaStr = sozler.map(sz => sz.oda).filter(Boolean).join(" + ");
      const toplamKira = sozler.reduce((s, sz) => s + sz.aylikKira, 0);
      const bitis = sozler[0]?.bitisTarihi ? new Date(sozler[0].bitisTarihi).toLocaleDateString("tr-TR") : "";
      return {
        "Ad": o.ad, "Soyad": o.soyad, "TC Kimlik": o.tcKimlik ?? "",
        "Cinsiyet": o.cinsiyet ?? "", "Telefon": o.telefon, "E-posta": o.email ?? "",
        "Öğrenci No": o.ogrenciNo ?? "", "Üniversite": o.universite ?? "", "Bölüm": o.bolum ?? "",
        "Blok/Daire": konutStr || "Atanmamış",
        "Oda": odaStr || (sozler.length > 0 ? "Tüm Daire" : ""),
        "Aylık Kira (₺)": toplamKira || "",
        "Sözleşme Bitiş": bitis,
        "Acil Kişi": o.acilKisi ?? "", "Acil Tel": o.acilTelefon ?? "",
        "Kimlik Belgesi": o.kimlikBelgesi ? "Yüklendi" : "Eksik",
        "Öğrenci Belgesi": o.ogrenciBelgesi ? "Yüklendi" : "Eksik",
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kiracılar");
    XLSX.writeFile(wb, `UNIGARDEN_Kiracilar_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const importExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[wb.SheetNames[0]]);
    for (const r of rows) {
      await fetch("/api/ogrenciler", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad: r["Ad"] ?? "", soyad: r["Soyad"] ?? "", tcKimlik: r["TC Kimlik"] ?? "",
          telefon: r["Telefon"] ?? "", email: r["E-posta"] ?? "",
          cinsiyet: r["Cinsiyet"], ogrenciNo: r["Öğrenci No"],
          universite: r["Üniversite"], bolum: r["Bölüm"],
        }),
      });
    }
    load(); e.target.value = "";
  };

  const col = (id: KolonId) => kolonlar.has(id);
  const router = useRouter();

  return (
    <div className="space-y-3">
      {/* ── Üst bar ─────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-3 shadow-sm">

        {/* Satır 1: Arama + sağ butonlar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={arama}
              onChange={e => setArama(e.target.value)}
              placeholder="Ad, TC, telefon veya e-posta ara..."
              className="w-full border border-gray-200 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-emerald-400"
            />
            {arama && (
              <button onClick={() => setArama("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtrele butonu */}
          <div className="relative">
            <button
              onClick={() => setFiltrePanelAcik(a => !a)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                aktifFiltreAdet > 0
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2M13 16h-2" />
              </svg>
              Filtrele
              {aktifFiltreAdet > 0 && (
                <span className="bg-white text-emerald-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {aktifFiltreAdet}
                </span>
              )}
            </button>
          </div>

          {/* Kolon seçimi */}
          <div className="relative">
            <button
              onClick={() => setKolonPanelAcik(a => !a)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Kolonlar
              <span className="text-xs text-gray-400">({kolonlar.size}/{KOLON_TANIMLARI.length})</span>
            </button>

            {kolonPanelAcik && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 w-56 p-3">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-600">Kolon Görünürlüğü</span>
                  <button
                    onClick={() => setKolonlar(VARSAYILAN_KOLONLAR)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Tümü
                  </button>
                </div>
                <div className="space-y-1">
                  {KOLON_TANIMLARI.map(k => (
                    <label key={k.id} className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 text-sm ${k.zorunlu ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <input
                        type="checkbox"
                        checked={kolonlar.has(k.id)}
                        disabled={k.zorunlu}
                        onChange={() => toggleKolon(k.id)}
                        className="rounded text-emerald-600"
                      />
                      <span className="text-gray-700">{k.label}</span>
                      {k.zorunlu && <span className="text-xs text-gray-400 ml-auto">Sabit</span>}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

          <button onClick={exportExcel} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
            <Download size={14} /> İndir
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
            <Upload size={14} /> Yükle
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={importExcel} />

          <button
            onClick={() => { setEditItem(undefined); setModal(true); }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 ml-auto"
          >
            <Plus size={15} /> Yeni Kiracı
          </button>
        </div>

        {/* Filtre paneli */}
        {filtrePanelAcik && (
          <div className="border-t border-gray-100 pt-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Üniversite</label>
                <select value={uniFiltre} onChange={e => setUniFiltre(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-emerald-400">
                  <option value="">Tümü</option>
                  {uniler.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Blok</label>
                <select value={blokFiltre} onChange={e => setBlokFiltre(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-emerald-400">
                  <option value="">Tüm Bloklar</option>
                  {bloklar.map(b => <option key={b} value={b}>Blok {b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cinsiyet</label>
                <select value={cinsFiltre} onChange={e => setCinsFiltre(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-emerald-400">
                  <option value="">Tümü</option>
                  <option value="Erkek">Erkek</option>
                  <option value="Kadın">Kadın</option>
                  <option value="Belirtilmemiş">Belirtilmemiş</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Daire Durumu</label>
                <select value={daireDurum} onChange={e => setDaireDurum(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-emerald-400">
                  <option value="">Tümü</option>
                  <option value="atanmis">Daireye Atanmış</option>
                  <option value="atanmamis">Atanmamış</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Evrak Durumu</label>
                <select value={evrakDurum} onChange={e => setEvrakDurum(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-emerald-400">
                  <option value="">Tümü</option>
                  <option value="tam">Evraklar Tam</option>
                  <option value="eksik">Evrak Eksik</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Sözleşme Bitiş</label>
                <select value={bitisFiltre} onChange={e => setBitisFiltre(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-emerald-400">
                  <option value="">Tümü</option>
                  <option value="30">30 gün içinde</option>
                  <option value="90">90 gün içinde</option>
                  <option value="gecmis">Süresi dolmuş</option>
                </select>
              </div>
            </div>

            {aktifFiltreAdet > 0 && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">{aktifFiltreAdet} filtre aktif</span>
                <button onClick={filtreSifirla} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                  <X size={12} /> Filtreleri Sıfırla
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sonuç özeti */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-xs text-gray-500 font-medium">
          {gosterilen.length} / {ogrenciler.length} kiracı gösteriliyor
        </span>
        {/* Aktif filtre rozetleri */}
        {uniFiltre    && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">{uniFiltre} <button onClick={() => setUniFiltre("")}><X size={10}/></button></span>}
        {blokFiltre   && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">Blok {blokFiltre} <button onClick={() => setBlokFiltre("")}><X size={10}/></button></span>}
        {cinsFiltre   && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">{cinsFiltre} <button onClick={() => setCinsFiltre("")}><X size={10}/></button></span>}
        {daireDurum   && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1">{daireDurum === "atanmis" ? "Atanmış" : "Atanmamış"} <button onClick={() => setDaireDurum("")}><X size={10}/></button></span>}
        {evrakDurum   && <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">{evrakDurum === "tam" ? "Evrak Tam" : "Evrak Eksik"} <button onClick={() => setEvrakDurum("")}><X size={10}/></button></span>}
        {bitisFiltre  && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">{bitisFiltre === "gecmis" ? "Süresi Dolmuş" : `${bitisFiltre}g içinde`} <button onClick={() => setBitisFiltre("")}><X size={10}/></button></span>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ad Soyad</th>
              {col("tcNo")       && <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">TC / Öğr. No</th>}
              {col("cinsiyet")   && <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cinsiyet</th>}
              {col("telefon")    && <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Telefon / E-posta</th>}
              {col("universite") && <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Üniversite / Bölüm</th>}
              {col("blokDaire")  && <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Blok / Daire</th>}
              {col("oda")        && <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Oda</th>}
              {col("kira")       && <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kira (₺)</th>}
              {col("bitisT")     && <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sözleşme Bitiş</th>}
              {col("evraklar")   && <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Evraklar</th>}
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {gosterilen.map(o => {
              const sozler = o.sozlesmeler ?? [];
              const toplamKira = sozler.reduce((s, sz) => s + sz.aylikKira, 0);
              const odalar = sozler.map(sz => sz.oda).filter(Boolean).join(" + ");
              const konutlar = [...new Set(sozler.map(sz => `${sz.konut.blok} ${sz.konut.daireNo}`))].join(", ");
              const bitisTarihi = sozler[0]?.bitisTarihi;

              return (
                <tr
                  key={o.id}
                  className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/ogrenciler/${o.id}`)}
                >
                  {/* Ad Soyad */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${o.cinsiyet === "Erkek" ? "bg-blue-100" : o.cinsiyet === "Kadın" ? "bg-pink-100" : "bg-violet-100"}`}>
                        <User size={13} className={o.cinsiyet === "Erkek" ? "text-blue-600" : o.cinsiyet === "Kadın" ? "text-pink-600" : "text-violet-600"} />
                      </div>
                      <p className="font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">{o.ad} {o.soyad}</p>
                    </div>
                  </td>

                  {/* TC / Öğr. No */}
                  {col("tcNo") && (
                    <td className="px-4 py-3 text-gray-500">
                      <p className="font-mono text-xs">{o.tcKimlik ?? "—"}</p>
                      {o.ogrenciNo && <p className="text-xs text-gray-400">{o.ogrenciNo}</p>}
                    </td>
                  )}

                  {/* Cinsiyet */}
                  {col("cinsiyet") && (
                    <td className="px-4 py-3">
                      {o.cinsiyet ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CINSIYET_RENK[o.cinsiyet] ?? "bg-gray-100 text-gray-500"}`}>
                          {o.cinsiyet}
                        </span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                  )}

                  {/* Telefon / E-posta */}
                  {col("telefon") && (
                    <td className="px-4 py-3 text-gray-500">
                      <span className="flex items-center gap-1 text-xs"><Phone size={11} />{o.telefon}</span>
                      {o.email && <span className="flex items-center gap-1 text-xs text-gray-400"><Mail size={10} />{o.email}</span>}
                    </td>
                  )}

                  {/* Üniversite / Bölüm */}
                  {col("universite") && (
                    <td className="px-4 py-3 text-gray-500">
                      <span className="flex items-center gap-1 text-xs"><GraduationCap size={11} />{o.universite ?? "—"}</span>
                      {o.bolum && <span className="text-xs text-gray-400 block mt-0.5">{o.bolum}</span>}
                    </td>
                  )}

                  {/* Blok / Daire */}
                  {col("blokDaire") && (
                    <td className="px-4 py-3">
                      {konutlar ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">{konutlar}</span>
                      ) : (
                        <span className="text-xs text-gray-300">Atanmamış</span>
                      )}
                    </td>
                  )}

                  {/* Oda */}
                  {col("oda") && (
                    <td className="px-4 py-3">
                      {odalar ? (
                        <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">{odalar}</span>
                      ) : sozler.length > 0 ? (
                        <span className="text-xs text-gray-400">Tüm Daire</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  )}

                  {/* Kira */}
                  {col("kira") && (
                    <td className="px-4 py-3">
                      {toplamKira > 0 ? (
                        <span className="text-xs font-bold text-gray-800">
                          ₺{toplamKira.toLocaleString("tr-TR")}
                          {sozler.length > 1 && <span className="text-gray-400 font-normal"> ({sozler.length} oda)</span>}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  )}

                  {/* Sözleşme Bitiş */}
                  {col("bitisT") && (
                    <td className="px-4 py-3">
                      {bitisTarihi ? (() => {
                        const gun = Math.ceil((new Date(bitisTarihi).getTime() - Date.now()) / 86400000);
                        return (
                          <span className={`text-xs px-2 py-1 rounded-lg font-medium ${gun < 30 ? "bg-red-50 text-red-600" : gun < 90 ? "bg-yellow-50 text-yellow-700" : "bg-gray-50 text-gray-500"}`}>
                            {new Date(bitisTarihi).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                            {gun < 90 && <span className="ml-1">({gun}g)</span>}
                          </span>
                        );
                      })() : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  )}

                  {/* Evraklar */}
                  {col("evraklar") && (
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setEvrakItem(o)} className="hover:opacity-80 transition-opacity">
                        <EvrakDurumu kimlik={o.kimlikBelgesi ?? undefined} ogrenci={o.ogrenciBelgesi ?? undefined} />
                      </button>
                    </td>
                  )}

                  {/* İşlem */}
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditItem(o); setModal(true); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="Düzenle"><Pencil size={14} /></button>
                      <button onClick={() => setSifreItem(o)} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" title="Şifre Belirle"><KeyRound size={14} /></button>
                      <button onClick={() => setSilOnay(o.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600" title="Sil"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {gosterilen.length === 0 && (
              <tr><td colSpan={1 + KOLON_TANIMLARI.filter(k => kolonlar.has(k.id)).length + 1} className="px-4 py-8 text-center text-gray-400">Kayıt bulunamadı</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && <OgrenciModal initial={editItem} onClose={() => { setModal(false); setEditItem(undefined); }} onSaved={load} />}
      {sifreItem && <SifreModal ogrenci={sifreItem} onClose={() => setSifreItem(null)} />}
      {evrakItem && (
        <EvrakModal
          ogrenci={evrakItem}
          onClose={() => setEvrakItem(null)}
          onSaved={(updated) => {
            setOgrenciler(prev => prev.map(o => o.id === updated.id ? updated : o));
            setEvrakItem(updated);
          }}
        />
      )}

      {silOnay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <p className="text-gray-700 mb-4">Bu kiracıyı silmek istediğinize emin misiniz?</p>
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
