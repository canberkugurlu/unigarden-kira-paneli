"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Building2, User, Phone, Mail, Pencil, ChevronRight,
  CheckCircle2, Clock, AlertCircle, Wrench, FileText, TrendingUp,
  ShieldCheck, Image as ImageIcon, X, Calendar, CreditCard,
  Home, BarChart3, UserCheck, AlertTriangle, BadgeCheck,
  LogIn, LogOut, Eye,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DaireSahibi { id: string; ad: string; soyad: string; telefon: string; email?: string }

interface Ogrenci { id: string; ad: string; soyad: string; telefon: string; email?: string; cinsiyet?: string; universite?: string; kimlikBelgesi?: string; ogrenciBelgesi?: string }

interface Odeme { id: string; tutar: number; tip: string; odenmeTarihi: string; aciklama?: string }

interface Sozlesme {
  id: string; sozlesmeNo: string; baslangicTarihi: string; bitisTarihi: string;
  aylikKira: number; depozito: number; kiraOdemGunu: number; ozelSartlar?: string;
  durum: string; oda?: string; imzaTarihi: string;
  ogrenci: Ogrenci;
  odemeler: Odeme[];
}

interface BakimTalebi {
  id: string; baslik: string; aciklama: string; durum: string; oncelik: string;
  olusturmaTar: string; tamamlanmaTar?: string;
  ogrenci: { ad: string; soyad: string };
}

interface Hasar { aciklama: string; tutar: number; fotoUrl?: string }

interface TeslimRaporu {
  id: string; tip: string; tarih: string; durumNotu?: string;
  hasarlar?: string; toplamTutar: number; dosyaYolu?: string; onaylandi: boolean;
  ogrenci?: { id: string; ad: string; soyad: string } | null;
}

interface Aidat {
  id: string; yil: number; ay: number; tutar: number;
  durum: string; odemeTarihi?: string; aciklama?: string;
}

interface Belge { id: string; ad: string; tip: string; dosyaYolu: string; olusturmaTar: string; yukleyenTip: string }

interface Konut {
  id: string; blok: string; katNo: number; daireNo: string;
  tip: string; metrekare: number; kiraBedeli: number; durum: string;
  ozellikler?: string; etap: number; olusturmaTar: string;
  daireSahibi?: DaireSahibi | null;
  sozlesmeler: Sozlesme[];
  bakimTalepleri: BakimTalebi[];
  teslimRaporlari: TeslimRaporu[];
  aidatlar: Aidat[];
  belgeler: Belge[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt     = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
const para    = (n: number) => `₺${n.toLocaleString("tr-TR")}`;
const AYLAR   = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
const DURUM_RENK: Record<string,string> = { Dolu:"bg-red-100 text-red-700", Bos:"bg-green-100 text-green-700", Bakimda:"bg-yellow-100 text-yellow-700" };
const DURUM_LABEL: Record<string,string> = { Dolu:"Dolu", Bos:"Boş", Bakimda:"Bakımda" };

function parseOzellikler(raw?: string): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return raw.split(",").map(s => s.trim()).filter(Boolean); }
}

// 2. Etap konseptleri: A/B/C = Kız, D/E = Erkek, F/G = Apart (gri). F karma — ozellikler tagʼına göre override edilebilir.
type DaireTema = { iconBg: string; bar: string; accent: string; bannerBg: string; bannerBorder: string; label: string };
function getDaireTema(blok: string, etap: number, ozellikler?: string): DaireTema | null {
  if (etap !== 2) return null;
  const u = (blok || "").charAt(0).toUpperCase();
  const kiz   = { iconBg: "bg-pink-400",  bar: "bg-pink-400",  accent: "text-pink-600",  bannerBg: "bg-pink-50",  bannerBorder: "border-pink-200",  label: "Kız Yurdu"   };
  const erkek = { iconBg: "bg-blue-500",  bar: "bg-blue-500",  accent: "text-blue-600",  bannerBg: "bg-blue-50",  bannerBorder: "border-blue-200",  label: "Erkek Yurdu" };
  const apart = { iconBg: "bg-gray-400",  bar: "bg-gray-400",  accent: "text-gray-600",  bannerBg: "bg-gray-50",  bannerBorder: "border-gray-200",  label: "Apart"       };
  if (["A", "B", "C"].includes(u)) return kiz;
  if (["D", "E"].includes(u))      return erkek;
  if (u === "G")                   return apart;
  if (u === "F") {
    const o = (ozellikler ?? "").toLowerCase();
    if (o.includes("kız") || o.includes("kiz")) return kiz;
    if (o.includes("erkek"))                    return erkek;
    return apart;
  }
  return null;
}
function parseHasarlar(raw?: string): Hasar[] {
  if (!raw) return [];
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
}
function parseFotolar(raw?: string): string[] {
  if (!raw) return [];
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [raw]; } catch { return raw ? [raw] : []; }
}

function Bolum({ baslik, children, icon: Icon, sag }: { baslik: string; children: React.ReactNode; icon?: React.ElementType; sag?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={15} className="text-gray-500" />}
          <h3 className="text-sm font-semibold text-gray-700">{baslik}</h3>
        </div>
        {sag}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoSatir({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className={`text-sm text-right ${mono ? "font-mono text-xs" : ""} ${bold ? "font-semibold text-gray-800" : "text-gray-700"}`}>{value}</span>
    </div>
  );
}

// ─── Fotoğraf Galerisİ ───────────────────────────────────────────────────────
function FotoGalerisi({ urls, baslik }: { urls: string[]; baslik?: string }) {
  const [buyuk, setBuyuk] = useState<string | null>(null);
  if (!urls.length) return null;
  return (
    <div>
      {baslik && <p className="text-xs font-semibold text-gray-400 mb-2">{baslik}</p>}
      <div className="flex flex-wrap gap-2">
        {urls.map((url, i) => (
          <button key={i} onClick={() => setBuyuk(url)}
            className="w-20 h-20 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 hover:opacity-80 transition-opacity relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`foto-${i}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-opacity">
              <Eye size={16} className="text-white" />
            </div>
          </button>
        ))}
      </div>
      {buyuk && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]" onClick={() => setBuyuk(null)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setBuyuk(null)} className="absolute -top-10 right-0 text-white"><X size={24} /></button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={buyuk} alt="Büyük" className="rounded-xl max-h-[85vh] max-w-[90vw] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Aidat Takvimi ───────────────────────────────────────────────────────────
function AidatTakvimi({ aidatlar }: { aidatlar: Aidat[] }) {
  const grouped: Record<number, Record<number, Aidat>> = {};
  aidatlar.forEach(a => {
    if (!grouped[a.yil]) grouped[a.yil] = {};
    grouped[a.yil][a.ay] = a;
  });
  const yillar = Object.keys(grouped).map(Number).sort((a, b) => b - a);

  return (
    <div className="space-y-4">
      {yillar.map(yil => (
        <div key={yil}>
          <p className="text-xs font-semibold text-gray-500 mb-2">{yil}</p>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(ay => {
              const aidat = grouped[yil]?.[ay];
              return (
                <div key={ay} title={aidat ? `${AYLAR[ay-1]}: ${para(aidat.tutar)} — ${aidat.durum}` : `${AYLAR[ay-1]}: Kayıt yok`}
                  className={`rounded-md p-1 text-center cursor-default ${
                    !aidat ? "bg-gray-100" :
                    aidat.durum === "Odendi" ? "bg-emerald-100" :
                    aidat.durum === "Gecikti" ? "bg-red-100" : "bg-yellow-100"
                  }`}>
                  <p className="text-xs font-medium text-gray-600">{AYLAR[ay-1]}</p>
                  {aidat && <p className={`text-xs font-bold ${
                    aidat.durum === "Odendi" ? "text-emerald-700" :
                    aidat.durum === "Gecikti" ? "text-red-700" : "text-yellow-700"
                  }`}>{aidat.durum === "Odendi" ? "✓" : aidat.durum === "Gecikti" ? "!" : "—"}</p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        {[{ renk:"bg-emerald-100",label:"Ödendi" },{ renk:"bg-yellow-100",label:"Bekliyor" },{ renk:"bg-red-100",label:"Gecikti" },{ renk:"bg-gray-100",label:"Kayıt yok" }].map(({ renk, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${renk}`} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function DaireKartPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const [konut, setKonut] = useState<Konut | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifTab, setAktifTab] = useState<"genel"|"kiraci"|"teslim"|"bakim"|"aidat"|"belge">("genel");

  useEffect(() => {
    setYukleniyor(true);
    fetch(`/api/konutlar/${id}`).then(r => r.ok ? r.json() : null).then(d => { setKonut(d); setYukleniyor(false); });
  }, [id]);

  if (yukleniyor) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!konut) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
      <AlertCircle size={32} /><p>Daire bulunamadı.</p>
      <button onClick={() => router.back()} className="text-emerald-600 text-sm hover:underline">Geri dön</button>
    </div>
  );

  const daireTema   = getDaireTema(konut.blok, konut.etap, konut.ozellikler);
  const aktifSozler = konut.sozlesmeler.filter(s => s.durum === "Aktif").sort((a, b) => (a.oda ?? "").localeCompare(b.oda ?? ""));
  const aktifSoz    = aktifSozler[0];
  const toplamKiraci = new Set(konut.sozlesmeler.map(s => s.ogrenci?.id).filter(Boolean)).size;
  const toplamGelir  = konut.sozlesmeler.flatMap(s => s.odemeler).reduce((sum, o) => sum + o.tutar, 0);
  const bekleyenBakim = konut.bakimTalepleri.filter(b => b.durum !== "Tamamlandi" && b.durum !== "Iptal").length;
  const ozellikler   = parseOzellikler(konut.ozellikler);
  const toplamAktifKira = aktifSozler.reduce((s, x) => s + x.aylikKira, 0);
  // Yurt dairesi (2 oda) mi?
  const isYurt    = konut.etap === 2 && ["A","B","C","D","E","F"].includes((konut.blok ?? "").charAt(0).toUpperCase());
  const odaSayisi = isYurt ? 2 : 1;
  // Toplam liste kira: yurtta konut.kiraBedeli * 2 (iki odanın toplam liste fiyatı)
  const toplamListeKira = konut.kiraBedeli * odaSayisi;
  // Doluluk yüzdesi (yurt için)
  const dolulukYuzde = isYurt
    ? Math.round((aktifSozler.length / odaSayisi) * 100)
    : (konut.durum === "Dolu" ? 100 : 0);
  const dolulukLabel = isYurt
    ? (aktifSozler.length === 0 ? "Boş" : aktifSozler.length >= odaSayisi ? "Dolu" : `%${dolulukYuzde}`)
    : (DURUM_LABEL[konut.durum] ?? konut.durum);
  // En erken biten aktif sözleşmenin kalan süresi
  const enErkenBitis = aktifSozler.length > 0
    ? aktifSozler.reduce((min, s) => new Date(s.bitisTarihi) < new Date(min.bitisTarihi) ? s : min)
    : null;
  const kalanGun = enErkenBitis ? Math.ceil((new Date(enErkenBitis.bitisTarihi).getTime() - Date.now()) / 86400000) : null;
  const kalanAy  = kalanGun !== null ? Math.floor(Math.max(0, kalanGun) / 30) : null;
  const kalanGunKalan = kalanGun !== null ? Math.max(0, kalanGun) % 30 : null;
  const odenenAidat  = konut.aidatlar.filter(a => a.durum === "Odendi").length;

  const TABS = [
    { id: "genel"  as const, label: "Daire Bilgileri" },
    { id: "kiraci" as const, label: `Kiracı Geçmişi (${toplamKiraci})` },
    { id: "teslim" as const, label: `Teslim Raporları (${konut.teslimRaporlari.length})` },
    { id: "bakim"  as const, label: `Bakım (${konut.bakimTalepleri.length})` },
    { id: "aidat"  as const, label: `Aidatlar (${konut.aidatlar.length})` },
    { id: "belge"  as const, label: `Belgeler (${konut.belgeler.length})` },
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => router.push("/konutlar")} className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
          <ArrowLeft size={15} /> Konutlar
        </button>
        <ChevronRight size={13} />
        <span className="text-gray-800 font-medium">Blok {konut.blok} · Daire {konut.daireNo}</span>
      </div>

      {/* ── Hero Kart ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className={`h-2 ${daireTema ? daireTema.bar : konut.durum === "Dolu" ? "bg-red-500" : konut.durum === "Bakimda" ? "bg-yellow-500" : "bg-emerald-500"}`} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* Sol: kimlik */}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${daireTema ? daireTema.iconBg : "bg-emerald-600"} flex items-center justify-center shrink-0`}>
                <Building2 size={28} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900">Blok {konut.blok} · Daire {konut.daireNo}</h1>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isYurt
                      ? (aktifSozler.length === 0 ? "bg-green-100 text-green-700"
                         : aktifSozler.length >= odaSayisi ? "bg-red-100 text-red-700"
                         : "bg-yellow-100 text-yellow-700")
                      : (DURUM_RENK[konut.durum] ?? "bg-gray-100 text-gray-500")
                  }`}>
                    {dolulukLabel}
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{konut.etap}. Etap</span>
                  {daireTema && (
                    <span className={`text-xs ${daireTema.bannerBg} ${daireTema.accent} px-2 py-0.5 rounded-full font-medium border ${daireTema.bannerBorder}`}>{daireTema.label}</span>
                  )}
                  {bekleyenBakim > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <AlertTriangle size={11} /> {bekleyenBakim} Bakım Talebi
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {konut.katNo}. Kat · {konut.tip} · {konut.metrekare} m²
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Kayıt: {fmt(konut.olusturmaTar)}
                  {konut.daireSahibi && ` · Sahip: ${konut.daireSahibi.ad} ${konut.daireSahibi.soyad}`}
                </p>
              </div>
            </div>

            {/* Sağ: istatistikler */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <p className={`text-xl font-bold ${daireTema ? daireTema.accent : "text-emerald-600"}`}>{para(toplamAktifKira || toplamListeKira)}</p>
                <p className="text-xs text-gray-400">{aktifSozler.length > 0 ? "Toplam Kira" : "Liste Kira"}</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-700">{aktifSozler.length}</p>
                <p className="text-xs text-gray-400">Aktif Kiracı</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-blue-600">{para(toplamGelir)}</p>
                <p className="text-xs text-gray-400">Toplam Gelir</p>
              </div>
              {kalanGun !== null && (
                <div className="text-center">
                  <p className={`text-xl font-bold ${kalanGun < 30 ? "text-red-600" : kalanGun < 90 ? "text-yellow-600" : "text-gray-700"}`}>
                    {kalanAy! > 0 ? `${kalanAy}a` : ""}{kalanAy! > 0 && kalanGunKalan! > 0 ? " " : ""}{kalanGunKalan! > 0 || kalanAy === 0 ? `${kalanGunKalan}g` : ""}
                  </p>
                  <p className="text-xs text-gray-400">Bitiş</p>
                </div>
              )}
            </div>
          </div>

          {/* Aktif kiracı banner — her aktif sözleşme için ayrı satır */}
          {aktifSozler.length > 0 && (
            <div className={`mt-4 ${daireTema ? `${daireTema.bannerBg} border ${daireTema.bannerBorder}` : "bg-red-50 border border-red-100"} rounded-xl px-4 py-2 divide-y ${daireTema ? daireTema.bannerBorder : "divide-red-100"}`}>
              {aktifSozler.map((s) => (
                <div key={s.id} className="py-2 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                    ${s.ogrenci.cinsiyet === "Erkek" ? "bg-blue-100 text-blue-600" : s.ogrenci.cinsiyet === "Kadın" ? "bg-pink-100 text-pink-600" : "bg-violet-100 text-violet-600"}`}>
                    {s.ogrenci.ad[0]}{s.ogrenci.soyad[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {s.ogrenci.ad} {s.ogrenci.soyad}
                      {s.oda && <span className="ml-2 text-xs font-normal text-gray-500">({s.oda})</span>}
                      <span className={`ml-2 text-xs font-medium ${daireTema?.accent ?? "text-gray-600"}`}>{para(s.aylikKira)}</span>
                    </p>
                    <p className="text-xs text-gray-500 truncate">{s.ogrenci.telefon} · {fmt(s.baslangicTarihi)} – {fmt(s.bitisTarihi)}</p>
                  </div>
                  <button onClick={() => router.push(`/ogrenciler/${s.ogrenci.id}`)}
                    className={`text-xs ${daireTema?.accent ?? "text-emerald-600"} hover:underline flex items-center gap-1 border ${daireTema?.bannerBorder ?? "border-emerald-200"} rounded-lg px-2.5 py-1.5 shrink-0 bg-white`}>
                    Kiracı Kartı <ChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Özellik etiketleri */}
          {ozellikler.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ozellikler.map(o => (
                <span key={o} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{o}</span>
              ))}
            </div>
          )}

          {/* Aksiyon */}
          <div className="mt-4 flex gap-2">
            <button onClick={() => router.push("/konutlar")}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">
              <Pencil size={13} /> Düzenle
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="border-t border-gray-100 flex overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setAktifTab(t.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                aktifTab === t.id ? "border-emerald-500 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Daire Bilgileri ── */}
      {aktifTab === "genel" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Bolum baslik="Daire Detayları" icon={Home}>
            <InfoSatir label="Blok"       value={`${konut.blok} Blok`} bold />
            <InfoSatir label="Daire No"   value={konut.daireNo} bold />
            <InfoSatir label="Kat"        value={`${konut.katNo}. Kat`} />
            <InfoSatir label="Tip"        value={konut.tip} />
            <InfoSatir label="Alan"       value={`${konut.metrekare} m²`} />
            <InfoSatir label="Etap"       value={`${konut.etap}. Etap`} />
            <InfoSatir label={isYurt ? "Toplam Kira" : "Liste Kira"} value={para(toplamListeKira)} bold />
            <InfoSatir label="Durum"      value={dolulukLabel} />
            {ozellikler.length > 0 && (
              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-2">ÖZELLİKLER</p>
                <div className="flex flex-wrap gap-1.5">
                  {ozellikler.map(o => <span key={o} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{o}</span>)}
                </div>
              </div>
            )}
          </Bolum>

          <Bolum baslik="Daire Sahibi" icon={UserCheck}>
            {konut.daireSahibi ? (
              <div className="space-y-1">
                <InfoSatir label="Ad Soyad" value={`${konut.daireSahibi.ad} ${konut.daireSahibi.soyad}`} bold />
                <InfoSatir label="Telefon"  value={konut.daireSahibi.telefon} />
                {konut.daireSahibi.email && <InfoSatir label="E-posta" value={konut.daireSahibi.email} />}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-gray-300">
                <UserCheck size={28} />
                <p className="text-sm mt-2">Sahip atanmamış</p>
              </div>
            )}
          </Bolum>

          {/* Özet İstatistikler */}
          <Bolum baslik="Özet İstatistikler" icon={BarChart3}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Toplam Sözleşme",    value: konut.sozlesmeler.length,     renk: "bg-blue-50 text-blue-700" },
                { label: "Toplam Kiracı",       value: toplamKiraci,                 renk: "bg-violet-50 text-violet-700" },
                { label: "Bakım Talebi",        value: konut.bakimTalepleri.length,  renk: "bg-orange-50 text-orange-700" },
                { label: "Teslim Raporu",       value: konut.teslimRaporlari.length, renk: "bg-teal-50 text-teal-700" },
                { label: "Toplam Gelir",        value: para(toplamGelir),            renk: "bg-emerald-50 text-emerald-700" },
                { label: "Aidat Ödeme Oranı",   value: konut.aidatlar.length > 0 ? `%${Math.round(odenenAidat / konut.aidatlar.length * 100)}` : "—", renk: "bg-gray-50 text-gray-700" },
              ].map(({ label, value, renk }) => (
                <div key={label} className={`rounded-xl p-3 ${renk}`}>
                  <p className="text-xs opacity-70">{label}</p>
                  <p className="text-lg font-bold mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </Bolum>

          {/* Aktif sözleşme özeti */}
          {aktifSoz && (
            <Bolum baslik="Aktif Sözleşme" icon={FileText}>
              <InfoSatir label="Sözleşme No" value={aktifSoz.sozlesmeNo} mono />
              <InfoSatir label="Kira" value={para(aktifSoz.aylikKira)} bold />
              <InfoSatir label="Depozito" value={para(aktifSoz.depozito)} />
              <InfoSatir label="Başlangıç" value={fmt(aktifSoz.baslangicTarihi)} />
              <InfoSatir label="Bitiş" value={fmt(aktifSoz.bitisTarihi)} />
              <InfoSatir label="Ödeme Günü" value={`Her ayın ${aktifSoz.kiraOdemGunu}. günü`} />
              {aktifSoz.ozelSartlar && <InfoSatir label="Özel Şartlar" value={aktifSoz.ozelSartlar} />}
              {kalanGun !== null && (
                <div className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2 ${
                  kalanGun < 0 ? "bg-red-100 text-red-700" : kalanGun < 30 ? "bg-red-50 text-red-600" : kalanGun < 90 ? "bg-yellow-50 text-yellow-700" : "bg-gray-50 text-gray-600"}`}>
                  <Calendar size={14} />
                  {kalanGun < 0 ? `Süresi ${Math.abs(kalanGun)} gün önce doldu` : `Bitişe ${kalanGun} gün kaldı`}
                </div>
              )}
            </Bolum>
          )}
        </div>
      )}

      {/* ── Kiracı Geçmişi ── */}
      {aktifTab === "kiraci" && (
        <div className="space-y-3">
          {konut.sozlesmeler.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">Henüz kiracı kaydı yok.</div>
          ) : konut.sozlesmeler.map(s => {
            const kira = s.odemeler.reduce((sum, o) => sum + o.tutar, 0);
            const kalanG = Math.ceil((new Date(s.bitisTarihi).getTime() - Date.now()) / 86400000);
            return (
              <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className={`px-5 py-3 border-b border-gray-100 flex items-center justify-between ${s.durum === "Aktif" ? "bg-emerald-50" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                      ${s.ogrenci.cinsiyet === "Erkek" ? "bg-blue-100 text-blue-700" : s.ogrenci.cinsiyet === "Kadın" ? "bg-pink-100 text-pink-700" : "bg-violet-100 text-violet-700"}`}>
                      {s.ogrenci.ad[0]}{s.ogrenci.soyad[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800">{s.ogrenci.ad} {s.ogrenci.soyad}</p>
                        {s.oda && <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">{s.oda}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.durum === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{s.durum}</span>
                      </div>
                      <p className="text-xs text-gray-400">{s.ogrenci.telefon} · {s.ogrenci.universite}</p>
                    </div>
                  </div>
                  <button onClick={() => router.push(`/ogrenciler/${s.ogrenci.id}`)}
                    className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5">
                    Kiracı Kartı <ChevronRight size={12} />
                  </button>
                </div>
                <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoSatir label="Aylık Kira"    value={para(s.aylikKira)} bold />
                  <InfoSatir label="Depozito"       value={para(s.depozito)} />
                  <InfoSatir label="Başlangıç"      value={fmt(s.baslangicTarihi)} />
                  <InfoSatir label="Bitiş"          value={fmt(s.bitisTarihi)} />
                  <InfoSatir label="Toplam Ödeme"   value={para(kira)} />
                  <InfoSatir label="Ödeme Sayısı"   value={String(s.odemeler.length)} />
                  {s.durum === "Aktif" && kalanG < 90 && (
                    <div className="col-span-2">
                      <InfoSatir label="Kalan Gün" value={kalanG < 0 ? `Süresi ${Math.abs(kalanG)}g önce doldu` : `${kalanG} gün`} />
                    </div>
                  )}
                </div>
                {s.odemeler.length > 0 && (
                  <div className="px-5 pb-4">
                    <p className="text-xs font-semibold text-gray-400 mb-2">SON ÖDEMELER</p>
                    <div className="space-y-1">
                      {s.odemeler.slice(0, 4).map(o => (
                        <div key={o.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-2">
                            <TrendingUp size={12} className="text-emerald-500" />
                            <span className="text-gray-600 text-xs">{o.tip}{o.aciklama ? ` · ${o.aciklama}` : ""}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-800 text-sm">{para(o.tutar)}</span>
                            <span className="text-xs text-gray-400">{fmt(o.odenmeTarihi)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Teslim Raporları ── */}
      {aktifTab === "teslim" && (
        <div className="space-y-4">
          {konut.teslimRaporlari.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">Teslim raporu bulunmuyor.</div>
          ) : konut.teslimRaporlari.map(r => {
            const hasarlar   = parseHasarlar(r.hasarlar);
            const daireFotolar = parseFotolar(r.dosyaYolu);
            return (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className={`px-5 py-3 border-b border-gray-100 flex items-center justify-between ${r.tip === "Giris" ? "bg-emerald-50" : "bg-orange-50"}`}>
                  <div className="flex items-center gap-3">
                    {r.tip === "Giris" ? <LogIn size={16} className="text-emerald-600" /> : <LogOut size={16} className="text-orange-600" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${r.tip === "Giris" ? "text-emerald-800" : "text-orange-800"}`}>
                          {r.tip === "Giris" ? "Giriş Teslimi" : "Çıkış Teslimi"}
                        </span>
                        {r.onaylandi && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <BadgeCheck size={11} /> Onaylı
                          </span>
                        )}
                        {r.toplamTutar > 0 && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                            {para(r.toplamTutar)} hasar
                          </span>
                        )}
                      </div>
                      {r.ogrenci && (
                        <p className="text-xs text-gray-500 mt-0.5">{r.ogrenci.ad} {r.ogrenci.soyad} · {fmt(r.tarih)}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{fmt(r.tarih)}</span>
                </div>

                <div className="p-5 space-y-4">
                  {r.durumNotu && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-400 mb-1">DURUM NOTU</p>
                      <p className="text-sm text-gray-700">{r.durumNotu}</p>
                    </div>
                  )}

                  {/* Hasar listesi */}
                  {hasarlar.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-2">HASAR KAYITLARI ({hasarlar.length})</p>
                      <div className="space-y-2">
                        {hasarlar.map((h, i) => (
                          <div key={i} className="bg-red-50 border border-red-100 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm text-red-800">{h.aciklama}</p>
                                {h.tutar > 0 && <p className="text-xs font-semibold text-red-600 mt-0.5">{para(h.tutar)}</p>}
                              </div>
                              {h.fotoUrl && (
                                <FotoGalerisi urls={[h.fotoUrl]} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Daire fotoğrafları */}
                  {daireFotolar.length > 0 && (
                    <FotoGalerisi urls={daireFotolar} baslik={`DAİRE FOTOĞRAFLARI (${daireFotolar.length})`} />
                  )}

                  {hasarlar.length === 0 && daireFotolar.length === 0 && (
                    <p className="text-sm text-gray-400 italic">Hasar veya fotoğraf kaydı yok.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Bakım Talepleri ── */}
      {aktifTab === "bakim" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
            <Wrench size={15} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Bakım Talepleri</h3>
          </div>
          {konut.bakimTalepleri.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">Bakım talebi bulunmuyor.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {konut.bakimTalepleri.map(b => (
                <div key={b.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${b.durum === "Tamamlandi" ? "bg-emerald-500" : b.durum === "Islemde" ? "bg-yellow-500" : b.durum === "Iptal" ? "bg-gray-300" : "bg-red-400"}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{b.baslik}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{b.aciklama}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {b.ogrenci.ad} {b.ogrenci.soyad} · {fmt(b.olusturmaTar)}
                          {b.tamamlanmaTar && ` · Tamamlandı: ${fmt(b.tamamlanmaTar)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        b.oncelik === "Acil" ? "bg-red-100 text-red-700" :
                        b.oncelik === "Yüksek" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-500"}`}>{b.oncelik}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        b.durum === "Tamamlandi" ? "bg-emerald-100 text-emerald-700" :
                        b.durum === "Islemde"    ? "bg-yellow-100 text-yellow-700" :
                        b.durum === "Iptal"      ? "bg-gray-100 text-gray-400" :
                        "bg-red-100 text-red-600"}`}>{b.durum}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Aidatlar ── */}
      {aktifTab === "aidat" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Ödenen", count: konut.aidatlar.filter(a => a.durum === "Odendi").length, renk: "bg-emerald-50 text-emerald-700 border-emerald-100" },
              { label: "Bekleyen", count: konut.aidatlar.filter(a => a.durum === "Bekliyor").length, renk: "bg-yellow-50 text-yellow-700 border-yellow-100" },
              { label: "Geciken", count: konut.aidatlar.filter(a => a.durum === "Gecikti").length, renk: "bg-red-50 text-red-700 border-red-100" },
            ].map(({ label, count, renk }) => (
              <div key={label} className={`rounded-xl border p-4 text-center ${renk}`}>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <Bolum baslik="Aidat Ödeme Takvimi" icon={Calendar}>
            {konut.aidatlar.length === 0
              ? <p className="text-sm text-gray-400 text-center py-4">Aidat kaydı bulunamadı.</p>
              : <AidatTakvimi aidatlar={konut.aidatlar} />}
          </Bolum>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60">
              <h3 className="text-sm font-semibold text-gray-700">Aidat Detayları</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Dönem</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Tutar</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Durum</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Ödeme Tarihi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {konut.aidatlar.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-700 font-medium">{AYLAR[a.ay-1]} {a.yil}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{para(a.tutar)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        a.durum === "Odendi"   ? "bg-emerald-100 text-emerald-700" :
                        a.durum === "Gecikti"  ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"}`}>{a.durum}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{a.odemeTarihi ? fmt(a.odemeTarihi) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Belgeler ── */}
      {aktifTab === "belge" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
            <ShieldCheck size={15} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Belgeler</h3>
          </div>
          {konut.belgeler.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">Belge bulunmuyor.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {konut.belgeler.map(b => (
                <div key={b.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ImageIcon size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{b.ad}</p>
                      <p className="text-xs text-gray-400">{b.tip} · {b.yukleyenTip} · {fmt(b.olusturmaTar)}</p>
                    </div>
                  </div>
                  <a href={b.dosyaYolu} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    <Eye size={13} /> Görüntüle
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
