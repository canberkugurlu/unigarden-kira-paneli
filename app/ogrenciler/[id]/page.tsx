"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, Phone, Mail, GraduationCap, Building2,
  FileText, AlertCircle, CheckCircle2, Clock, ShieldAlert,
  ShieldCheck, Pencil, KeyRound, Upload, Eye, Trash, X,
  TrendingUp, Wrench, LogIn, LogOut, CreditCard, FileImage,
  ChevronRight, BadgeCheck, AlertTriangle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Konut { id: string; blok: string; daireNo: string; etap: number; tip: string; katNo: number }

interface Odeme {
  id: string; tutar: number; tip: string;
  odenmeTarihi: string; aciklama?: string;
}

interface Sozlesme {
  id: string; sozlesmeNo: string; konutId: string; konut: Konut;
  baslangicTarihi: string; bitisTarihi: string;
  aylikKira: number; depozito: number; kiraOdemGunu: number;
  ozelSartlar?: string; durum: string; oda?: string;
  odemeler: Odeme[];
}

interface BakimTalebi {
  id: string; baslik: string; durum: string; oncelik: string;
  olusturmaTar: string; konut: { blok: string; daireNo: string };
}

interface TeslimRaporu {
  id: string; tip: string; tarih: string;
  durumNotu?: string; toplamTutar: number; onaylandi: boolean;
  konut: { blok: string; daireNo: string };
}

interface TurnikeLog {
  id: string; yon: string; zaman: string; kapi: string; engellendi: boolean;
}

interface TurnikeEngel {
  id: string; neden: string; engelleyen: string; tarih: string; aktif: boolean;
}

interface GunlukOdeme {
  id: string; tutar: number; tip: string; odenmeTarihi: string;
  banka?: string; aciklama?: string; eslestirildi: boolean;
}

interface Ogrenci {
  id: string; ad: string; soyad: string; tcKimlik?: string;
  ogrenciNo?: string; universite?: string; bolum?: string;
  telefon: string; email?: string; acilKisi?: string; acilTelefon?: string;
  notlar?: string; cinsiyet?: string; kimlikBelgesi?: string; ogrenciBelgesi?: string;
  olusturmaTar: string;
  sozlesmeler: Sozlesme[];
  bakimTalepleri: BakimTalebi[];
  teslimRaporlari: TeslimRaporu[];
  turnikeLoglari: TurnikeLog[];
  turnikeEngeli?: TurnikeEngel | null;
  gunlukOdemeler: GunlukOdeme[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
const fmtSaat = (d: string) => new Date(d).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
const para = (n: number) => `₺${n.toLocaleString("tr-TR")}`;

function Rozet({ renk, children }: { renk: string; children: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${renk}`}>{children}</span>;
}

function Bolum({ baslik, children, icon: Icon }: { baslik: string; children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
        {Icon && <Icon size={15} className="text-gray-500" />}
        <h3 className="text-sm font-semibold text-gray-700">{baslik}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Edit Modal (lightweight — only personal fields) ─────────────────────────

function DuzenlemeModal({ ogrenci, onClose, onSaved }: { ogrenci: Ogrenci; onClose: () => void; onSaved: (o: Ogrenci) => void }) {
  const [form, setForm] = useState({
    ad: ogrenci.ad, soyad: ogrenci.soyad, tcKimlik: ogrenci.tcKimlik ?? "",
    ogrenciNo: ogrenci.ogrenciNo ?? "", universite: ogrenci.universite ?? "",
    bolum: ogrenci.bolum ?? "", telefon: ogrenci.telefon, email: ogrenci.email ?? "",
    acilKisi: ogrenci.acilKisi ?? "", acilTelefon: ogrenci.acilTelefon ?? "",
    notlar: ogrenci.notlar ?? "", cinsiyet: ogrenci.cinsiyet ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [hata, setHata] = useState("");

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    if (!form.ad || !form.soyad || !form.telefon) { setHata("Ad, soyad ve telefon zorunludur."); return; }
    setSaving(true);
    const res = await fetch(`/api/ogrenciler/${ogrenci.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { const updated = await res.json(); onSaved({ ...ogrenci, ...updated }); onClose(); }
    else { const j = await res.json(); setHata(j.error ?? "Hata"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Kiracı Düzenle</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Ad</label><input value={form.ad} onChange={f("ad")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">Soyad</label><input value={form.soyad} onChange={f("soyad")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">TC Kimlik No</label><input value={form.tcKimlik} onChange={f("tcKimlik")} maxLength={11} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">Öğrenci No</label><input value={form.ogrenciNo} onChange={f("ogrenciNo")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Üniversite</label><input value={form.universite} onChange={f("universite")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">Bölüm</label><input value={form.bolum} onChange={f("bolum")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Telefon</label><input value={form.telefon} onChange={f("telefon")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">E-posta</label><input value={form.email} onChange={f("email")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Cinsiyet</label>
            <select value={form.cinsiyet} onChange={f("cinsiyet")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
              <option value="">Belirtilmemiş</option>
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500">Acil Kişi</label><input value={form.acilKisi} onChange={f("acilKisi")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-xs text-gray-500">Acil Telefon</label><input value={form.acilTelefon} onChange={f("acilTelefon")} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
          </div>
          <div><label className="text-xs text-gray-500">Notlar</label><textarea value={form.notlar} onChange={f("notlar")} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1 resize-none" /></div>
        </div>
        {hata && <p className="text-red-600 text-xs mt-2 bg-red-50 rounded px-3 py-2">{hata}</p>}
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm">İptal</button>
          <button onClick={save} disabled={saving} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60">{saving ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KiraciKartPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ogrenci, setOgrenci] = useState<Ogrenci | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [duzenlemeAcik, setDuzenlemeAcik] = useState(false);
  const [onizleme, setOnizleme] = useState<string | null>(null);
  const kimlikRef = useRef<HTMLInputElement>(null);
  const ogrenciRef = useRef<HTMLInputElement>(null);
  const [belgeYukleniyor, setBelgeYukleniyor] = useState<"kimlik" | "ogrenci" | null>(null);
  const [aktifTab, setAktifTab] = useState<"genel" | "sozlesmeler" | "odemeler" | "bakim" | "turnike">("genel");

  useEffect(() => {
    setYukleniyor(true);
    fetch(`/api/ogrenciler/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setOgrenci(data); setYukleniyor(false); });
  }, [id]);

  const yenile = () => fetch(`/api/ogrenciler/${id}`).then(r => r.json()).then(setOgrenci);

  const belgeyukle = async (tip: "kimlik" | "ogrenci", dosya: File) => {
    setBelgeYukleniyor(tip);
    const fd = new FormData();
    fd.append("dosya", dosya);
    fd.append("tip", tip);
    await fetch(`/api/ogrenciler/${id}/belge`, { method: "POST", body: fd });
    setBelgeYukleniyor(null);
    yenile();
  };

  const belgesil = async (tip: "kimlik" | "ogrenci") => {
    await fetch(`/api/ogrenciler/${id}/belge`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tip }) });
    yenile();
  };

  if (yukleniyor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ogrenci) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <AlertCircle size={32} />
        <p>Kiracı bulunamadı.</p>
        <button onClick={() => router.back()} className="text-emerald-600 text-sm hover:underline">Geri dön</button>
      </div>
    );
  }

  const aktifSozler = ogrenci.sozlesmeler.filter(s => s.durum === "Aktif");
  const pasifSozler = ogrenci.sozlesmeler.filter(s => s.durum !== "Aktif");
  const toplamKira = aktifSozler.reduce((s, sz) => s + sz.aylikKira, 0);
  const enYakinBitis = aktifSozler.reduce<string | null>((min, s) => {
    if (!min) return s.bitisTarihi;
    return new Date(s.bitisTarihi) < new Date(min) ? s.bitisTarihi : min;
  }, null);
  const kalanGun = enYakinBitis ? Math.ceil((new Date(enYakinBitis).getTime() - Date.now()) / 86400000) : null;
  const engel = ogrenci.turnikeEngeli?.aktif ? ogrenci.turnikeEngeli : null;

  const evrakTam = !!ogrenci.kimlikBelgesi && !!ogrenci.ogrenciBelgesi;
  const evrakEksik = !ogrenci.kimlikBelgesi || !ogrenci.ogrenciBelgesi;

  const TABS = [
    { id: "genel" as const,       label: "Genel Bilgiler" },
    { id: "sozlesmeler" as const, label: `Sözleşmeler (${ogrenci.sozlesmeler.length})` },
    { id: "odemeler" as const,    label: `Ödemeler (${ogrenci.gunlukOdemeler.length})` },
    { id: "bakim" as const,       label: `Bakım (${ogrenci.bakimTalepleri.length})` },
    { id: "turnike" as const,     label: `Turnike (${ogrenci.turnikeLoglari.length})` },
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto">

      {/* Geri + breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => router.push("/ogrenciler")} className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
          <ArrowLeft size={15} /> Kiracılar
        </button>
        <ChevronRight size={13} />
        <span className="text-gray-800 font-medium">{ogrenci.ad} {ogrenci.soyad}</span>
      </div>

      {/* ── Hero Kart ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Üst şerit */}
        <div className={`h-2 ${engel ? "bg-red-500" : aktifSozler.length > 0 ? "bg-emerald-500" : "bg-gray-300"}`} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* Sol: avatar + isim */}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0
                ${ogrenci.cinsiyet === "Erkek" ? "bg-blue-100 text-blue-600" :
                  ogrenci.cinsiyet === "Kadın" ? "bg-pink-100 text-pink-600" :
                  "bg-violet-100 text-violet-600"}`}>
                {ogrenci.ad[0]}{ogrenci.soyad[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900">{ogrenci.ad} {ogrenci.soyad}</h1>
                  {engel && (
                    <Rozet renk="bg-red-100 text-red-700">
                      <ShieldAlert size={12} /> Turnike Engelli
                    </Rozet>
                  )}
                  {!engel && aktifSozler.length > 0 && (
                    <Rozet renk="bg-emerald-100 text-emerald-700">
                      <BadgeCheck size={12} /> Aktif Kiracı
                    </Rozet>
                  )}
                  {aktifSozler.length === 0 && !engel && (
                    <Rozet renk="bg-gray-100 text-gray-500">
                      <Clock size={12} /> Sözleşmesiz
                    </Rozet>
                  )}
                  {evrakEksik && (
                    <Rozet renk="bg-orange-100 text-orange-700">
                      <AlertTriangle size={12} /> Evrak Eksik
                    </Rozet>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {ogrenci.universite ? `${ogrenci.universite}${ogrenci.bolum ? ` · ${ogrenci.bolum}` : ""}` : "Üniversite belirtilmemiş"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Kayıt: {fmt(ogrenci.olusturmaTar)}
                  {ogrenci.cinsiyet && ` · ${ogrenci.cinsiyet}`}
                </p>
              </div>
            </div>

            {/* Sağ: özet istatistikler */}
            <div className="flex items-center gap-6 flex-wrap">
              {toplamKira > 0 && (
                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-600">{para(toplamKira)}</p>
                  <p className="text-xs text-gray-400">Aylık Kira</p>
                </div>
              )}
              {aktifSozler.length > 0 && (
                <div className="text-center">
                  <p className={`text-xl font-bold ${kalanGun !== null && kalanGun < 30 ? "text-red-600" : kalanGun !== null && kalanGun < 90 ? "text-yellow-600" : "text-gray-700"}`}>
                    {kalanGun !== null ? `${kalanGun}g` : "—"}
                  </p>
                  <p className="text-xs text-gray-400">Bitiş</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-xl font-bold text-gray-700">{ogrenci.gunlukOdemeler.filter(p => p.eslestirildi).length}</p>
                <p className="text-xs text-gray-400">Ödeme</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-700">{ogrenci.bakimTalepleri.length}</p>
                <p className="text-xs text-gray-400">Bakım Talebi</p>
              </div>
            </div>
          </div>

          {/* Aktif daire bilgisi */}
          {aktifSozler.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {aktifSozler.map(s => (
                <div key={s.id} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
                  <Building2 size={15} className="text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      Blok {s.konut.blok} · Daire {s.konut.daireNo}
                      {s.oda && <span className="ml-1 text-emerald-600">({s.oda})</span>}
                    </p>
                    <p className="text-xs text-emerald-600">{fmt(s.baslangicTarihi)} – {fmt(s.bitisTarihi)} · {para(s.aylikKira)}/ay</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Engel uyarısı */}
          {engel && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <ShieldAlert size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Turnike Engeli Aktif</p>
                <p className="text-xs text-red-600">Neden: {engel.neden} · Engelleyen: {engel.engelleyen} · Tarih: {fmt(engel.tarih)}</p>
              </div>
            </div>
          )}

          {/* Aksiyon butonları */}
          <div className="mt-4 flex gap-2 flex-wrap">
            <button onClick={() => setDuzenlemeAcik(true)}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">
              <Pencil size={13} /> Düzenle
            </button>
            <button onClick={() => kimlikRef.current?.click()}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">
              <Upload size={13} /> Evrak Yükle
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="border-t border-gray-100 flex overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setAktifTab(t.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                aktifTab === t.id
                  ? "border-emerald-500 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab İçerikleri ── */}

      {aktifTab === "genel" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Kişisel Bilgiler */}
          <Bolum baslik="Kişisel Bilgiler" icon={User}>
            <div className="space-y-3">
              <InfoSatir label="Ad Soyad" value={`${ogrenci.ad} ${ogrenci.soyad}`} />
              <InfoSatir label="TC Kimlik No" value={ogrenci.tcKimlik ?? "—"} mono />
              <InfoSatir label="Öğrenci No" value={ogrenci.ogrenciNo ?? "—"} />
              <InfoSatir label="Cinsiyet" value={ogrenci.cinsiyet ?? "Belirtilmemiş"} />
              <InfoSatir label="Üniversite" value={ogrenci.universite ?? "—"} />
              <InfoSatir label="Bölüm" value={ogrenci.bolum ?? "—"} />
              <div className="pt-2 border-t border-gray-100">
                <InfoSatir icon={<Phone size={13} className="text-gray-400" />} label="Telefon" value={ogrenci.telefon} />
                <InfoSatir icon={<Mail size={13} className="text-gray-400" />} label="E-posta" value={ogrenci.email ?? "—"} />
              </div>
              {(ogrenci.acilKisi || ogrenci.acilTelefon) && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 mb-2">ACİL KONTAK</p>
                  <InfoSatir label="Ad" value={ogrenci.acilKisi ?? "—"} />
                  <InfoSatir label="Telefon" value={ogrenci.acilTelefon ?? "—"} />
                </div>
              )}
              {ogrenci.notlar && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 mb-1">NOTLAR</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{ogrenci.notlar}</p>
                </div>
              )}
            </div>
          </Bolum>

          {/* Evraklar */}
          <Bolum baslik="Kimlik & Evraklar" icon={FileImage}>
            <div className="space-y-3">
              <BelgeKart
                label="Kimlik Belgesi"
                yol={ogrenci.kimlikBelgesi ?? undefined}
                yukleniyor={belgeYukleniyor === "kimlik"}
                onYukle={() => kimlikRef.current?.click()}
                onOnizle={url => setOnizleme(url)}
                onSil={() => belgesil("kimlik")}
              />
              <BelgeKart
                label="Öğrenci Belgesi"
                yol={ogrenci.ogrenciBelgesi ?? undefined}
                yukleniyor={belgeYukleniyor === "ogrenci"}
                onYukle={() => ogrenciRef.current?.click()}
                onOnizle={url => setOnizleme(url)}
                onSil={() => belgesil("ogrenci")}
              />
              {evrakTam && (
                <div className="flex items-center gap-2 text-emerald-600 text-xs bg-emerald-50 rounded-lg p-2.5">
                  <CheckCircle2 size={14} /> Tüm evraklar yüklendi
                </div>
              )}
            </div>
          </Bolum>

          {/* Teslim Raporları */}
          {ogrenci.teslimRaporlari.length > 0 && (
            <Bolum baslik="Teslim Raporları" icon={FileText}>
              <div className="space-y-2">
                {ogrenci.teslimRaporlari.map(r => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.tip === "Giris" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                        {r.tip === "Giris" ? "Giriş" : "Çıkış"}
                      </span>
                      <span className="text-sm text-gray-700">Blok {r.konut.blok} · {r.konut.daireNo}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{fmt(r.tarih)}</p>
                      {r.toplamTutar > 0 && <p className="text-xs font-medium text-red-600">{para(r.toplamTutar)}</p>}
                      {r.onaylandi && <span className="text-xs text-emerald-600">Onaylı</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Bolum>
          )}
        </div>
      )}

      {aktifTab === "sozlesmeler" && (
        <div className="space-y-4">
          {ogrenci.sozlesmeler.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
              Henüz sözleşme oluşturulmamış.
            </div>
          )}
          {ogrenci.sozlesmeler.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={`px-5 py-3 border-b border-gray-100 flex items-center justify-between ${s.durum === "Aktif" ? "bg-emerald-50" : "bg-gray-50"}`}>
                <div className="flex items-center gap-3">
                  <Building2 size={16} className={s.durum === "Aktif" ? "text-emerald-600" : "text-gray-400"} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Blok {s.konut.blok} · Daire {s.konut.daireNo}
                      {s.oda && <span className="text-gray-500 font-normal ml-1">({s.oda})</span>}
                    </p>
                    <p className="text-xs text-gray-500">No: {s.sozlesmeNo}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.durum === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {s.durum}
                </span>
              </div>
              <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoSatir label="Aylık Kira" value={para(s.aylikKira)} bold />
                <InfoSatir label="Depozito" value={para(s.depozito)} />
                <InfoSatir label="Başlangıç" value={fmt(s.baslangicTarihi)} />
                <InfoSatir label="Bitiş" value={fmt(s.bitisTarihi)} />
                <InfoSatir label="Ödeme Günü" value={`Her ayın ${s.kiraOdemGunu}. günü`} />
                <InfoSatir label="Ödeme Sayısı" value={String(s.odemeler.length)} />
                {s.ozelSartlar && <div className="col-span-2 md:col-span-4"><InfoSatir label="Özel Şartlar" value={s.ozelSartlar} /></div>}
              </div>
              {s.odemeler.length > 0 && (
                <div className="border-t border-gray-100 px-5 pb-4">
                  <p className="text-xs font-semibold text-gray-400 mb-2 mt-3">SON ÖDEMELER</p>
                  <div className="space-y-1">
                    {s.odemeler.slice(0, 5).map(o => (
                      <div key={o.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={13} className="text-emerald-500" />
                          <span className="text-gray-600">{o.tip}</span>
                          {o.aciklama && <span className="text-xs text-gray-400">{o.aciklama}</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-800">{para(o.tutar)}</span>
                          <span className="text-xs text-gray-400">{fmt(o.odenmeTarihi)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {aktifTab === "odemeler" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
            <CreditCard size={15} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Ödeme Geçmişi</h3>
            <span className="ml-auto text-xs text-gray-400">{ogrenci.gunlukOdemeler.length} kayıt</span>
          </div>
          {ogrenci.gunlukOdemeler.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Ödeme kaydı bulunamadı.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Tarih</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Tür</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Tutar</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Banka</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ogrenci.gunlukOdemeler.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-500 text-xs">{fmt(o.odenmeTarihi)}</td>
                    <td className="px-5 py-3 text-gray-700">{o.tip}</td>
                    <td className="px-5 py-3 font-semibold text-emerald-700">{para(o.tutar)}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{o.banka ?? "—"}</td>
                    <td className="px-5 py-3">
                      {o.eslestirildi
                        ? <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Eşleştirildi</span>
                        : <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">Bekliyor</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {aktifTab === "bakim" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
            <Wrench size={15} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Talepler</h3>
          </div>
          {ogrenci.bakimTalepleri.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Bakım talebi bulunamadı.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {ogrenci.bakimTalepleri.map(b => (
                <div key={b.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${b.durum === "Tamamlandı" ? "bg-emerald-500" : b.durum === "Devam Ediyor" ? "bg-yellow-500" : "bg-gray-400"}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{b.baslik}</p>
                      <p className="text-xs text-gray-400">Blok {b.konut.blok} · {b.konut.daireNo} · {fmt(b.olusturmaTar)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      b.oncelik === "Acil" ? "bg-red-100 text-red-700" :
                      b.oncelik === "Yüksek" ? "bg-orange-100 text-orange-700" :
                      "bg-gray-100 text-gray-500"}`}>
                      {b.oncelik}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      b.durum === "Tamamlandı" ? "bg-emerald-100 text-emerald-700" :
                      b.durum === "Devam Ediyor" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-500"}`}>
                      {b.durum}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {aktifTab === "turnike" && (
        <div className="space-y-4">
          {engel && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-700">Aktif Turnike Engeli</p>
                <p className="text-sm text-red-600 mt-0.5">Neden: {engel.neden}</p>
                <p className="text-xs text-red-500 mt-0.5">Engelleyen: {engel.engelleyen} · {fmtSaat(engel.tarih)}</p>
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
              <ShieldCheck size={15} className="text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Geçiş Logları</h3>
              <span className="ml-auto text-xs text-gray-400">Son {ogrenci.turnikeLoglari.length} kayıt</span>
            </div>
            {ogrenci.turnikeLoglari.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Log kaydı bulunamadı.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {ogrenci.turnikeLoglari.map(l => (
                  <div key={l.id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {l.yon === "Giris"
                        ? <LogIn size={15} className="text-emerald-500" />
                        : <LogOut size={15} className="text-orange-500" />}
                      <div>
                        <p className="text-sm font-medium text-gray-700">{l.yon === "Giris" ? "Giriş" : "Çıkış"}</p>
                        <p className="text-xs text-gray-400">{l.kapi}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{fmtSaat(l.zaman)}</p>
                      {l.engellendi && <p className="text-xs text-red-500">Engellendi</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Düzenleme modal */}
      {duzenlemeAcik && (
        <DuzenlemeModal
          ogrenci={ogrenci}
          onClose={() => setDuzenlemeAcik(false)}
          onSaved={updated => { setOgrenci(prev => prev ? { ...prev, ...updated } : prev); }}
        />
      )}

      {/* Gizli dosya inputları */}
      <input ref={kimlikRef} type="file" accept=".jpg,.jpeg,image/jpeg" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) belgeyukle("kimlik", f); e.target.value = ""; }} />
      <input ref={ogrenciRef} type="file" accept=".jpg,.jpeg,image/jpeg" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) belgeyukle("ogrenci", f); e.target.value = ""; }} />

      {/* Fotoğraf önizleme */}
      {onizleme && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setOnizleme(null)}>
          <div className="relative max-w-2xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setOnizleme(null)} className="absolute -top-10 right-0 text-white">
              <X size={24} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={onizleme} alt="Belge" className="rounded-xl max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Alt Bileşenler ───────────────────────────────────────────────────────────

function InfoSatir({ label, value, mono, bold, icon }: { label: string; value: string; mono?: boolean; bold?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1">
      <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">{icon}{label}</span>
      <span className={`text-sm text-right ${mono ? "font-mono text-xs" : ""} ${bold ? "font-semibold" : "text-gray-700"}`}>{value}</span>
    </div>
  );
}

function BelgeKart({ label, yol, yukleniyor, onYukle, onOnizle, onSil }: {
  label: string; yol?: string; yukleniyor: boolean;
  onYukle: () => void; onOnizle: (url: string) => void; onSil: () => void;
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileImage size={14} className={yol ? "text-emerald-600" : "text-red-400"} />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        {yol
          ? <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Yüklendi</span>
          : <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><AlertCircle size={11} />Eksik</span>}
      </div>
      {yol ? (
        <div className="relative rounded-lg overflow-hidden bg-gray-50 h-28 cursor-pointer" onClick={() => onOnizle(yol)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={yol} alt={label} className="h-full w-full object-contain" />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <Eye size={20} className="text-white" />
          </div>
        </div>
      ) : (
        <div className="h-16 rounded-lg border-2 border-dashed border-red-100 bg-red-50 flex items-center justify-center">
          <p className="text-xs text-red-300">Henüz yüklenmedi</p>
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={onYukle} disabled={yukleniyor}
          className="flex-1 flex items-center justify-center gap-1 text-xs border border-gray-200 text-gray-600 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <Upload size={12} />{yukleniyor ? "Yükleniyor..." : yol ? "Değiştir" : "JPEG Yükle"}
        </button>
        {yol && (
          <button onClick={onSil} className="p-1.5 text-red-400 hover:text-red-600 border border-red-100 rounded-lg hover:bg-red-50">
            <Trash size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
