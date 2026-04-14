"use client";

import { useEffect, useMemo, useState } from "react";
import { LogIn, Search, Shield, Building2, User, Users, Landmark } from "lucide-react";

interface Kullanici { id: string; ad: string; soyad: string; email: string; rol: string; aktif: boolean }
interface Sahip     { id: string; ad: string; soyad: string; email?: string | null; tcKimlik?: string | null; tip?: string; unvan?: string | null }
interface Ogrenci   { id: string; ad: string; soyad: string; email?: string | null; telefon?: string; tcKimlik?: string | null }

type Panel = "muhasebe" | "kiralama" | "evSahibi" | "kiraci";

const PANEL_META: Record<Panel, { label: string; icon: React.ElementType; renk: string; bg: string }> = {
  muhasebe: { label: "Muhasebe",    icon: Landmark,  renk: "text-blue-600",    bg: "bg-blue-50" },
  kiralama: { label: "Kiralama",    icon: Shield,    renk: "text-violet-600",  bg: "bg-violet-50" },
  evSahibi: { label: "Ev Sahipleri",icon: Building2, renk: "text-emerald-600", bg: "bg-emerald-50" },
  kiraci:   { label: "Kiracılar",   icon: User,      renk: "text-orange-600",  bg: "bg-orange-50" },
};

export default function PanellereErisim() {
  const [data, setData] = useState<{ muhasebe: Kullanici[]; kiralama: Kullanici[]; evSahibi: Sahip[]; kiraci: Ogrenci[] } | null>(null);
  const [aktif, setAktif] = useState<Panel>("muhasebe");
  const [arama, setArama] = useState("");
  const [gidiyor, setGidiyor] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/erisim/kullanicilar").then(r => r.json()).then(setData);
  }, []);

  const liste = useMemo(() => {
    if (!data) return [];
    const q = arama.toLowerCase();
    const items = data[aktif] as Array<Kullanici | Sahip | Ogrenci>;
    return items.filter(u => !q ||
      `${u.ad} ${u.soyad}`.toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q) ||
      ((u as Sahip).unvan ?? "").toLowerCase().includes(q));
  }, [data, aktif, arama]);

  const gir = async (u: Kullanici | Sahip | Ogrenci) => {
    setGidiyor(u.id);
    const targetType =
      aktif === "evSahibi" ? "DaireSahibi" :
      aktif === "kiraci"   ? "Ogrenci" : "Kullanici";
    const targetPanel = aktif === "evSahibi" ? "ev-sahibi" : aktif;
    const targetAd = ("unvan" in u && u.unvan) ? u.unvan : `${u.ad} ${u.soyad}`;

    const res = await fetch("/api/erisim/giris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: u.id, targetType, targetPanel, targetAd }),
    });
    setGidiyor(null);
    if (res.ok) {
      const { url } = await res.json();
      window.open(url, "_blank");
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Erişim tokeni oluşturulamadı");
    }
  };

  const sayilar = {
    muhasebe: data?.muhasebe.length ?? 0,
    kiralama: data?.kiralama.length ?? 0,
    evSahibi: data?.evSahibi.length ?? 0,
    kiraci:   data?.kiraci.length   ?? 0,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <LogIn size={20} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Panellere Erişim</h1>
          <p className="text-xs text-gray-500">Herhangi bir kullanıcının panelinde onun adına işlem yap — tüm hareketlerin log'a kaydedilir.</p>
        </div>
      </div>

      {/* Panel sekmeleri */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(Object.keys(PANEL_META) as Panel[]).map(p => {
          const { label, icon: Icon, renk, bg } = PANEL_META[p];
          const active = aktif === p;
          return (
            <button key={p} onClick={() => setAktif(p)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${active ? `${bg} border-transparent shadow-sm` : "bg-white border-gray-100 hover:border-gray-200"}`}>
              <span className={`w-9 h-9 rounded-lg ${active ? bg : "bg-gray-50"} flex items-center justify-center`}>
                <Icon size={18} className={renk} />
              </span>
              <div className="text-left flex-1">
                <p className={`text-sm font-semibold ${active ? renk : "text-gray-800"}`}>{label}</p>
                <p className="text-[10px] text-gray-500">{sayilar[p]} kullanıcı</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Arama */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={arama} onChange={e => setArama(e.target.value)} placeholder="Ad, soyad, e-posta veya unvan..."
          className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" />
      </div>

      <p className="text-xs text-gray-500">{liste.length} kullanıcı</p>

      {/* Liste */}
      {!data ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : liste.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>Kullanıcı bulunamadı</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {liste.map(u => {
            const unvan = "unvan" in u ? u.unvan : null;
            const ek = "rol" in u ? (u as Kullanici).rol : "tip" in u && u.tip === "Kurumsal" ? "Kurumsal" : "";
            const isim = unvan ?? `${u.ad} ${u.soyad}`;
            return (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                <div className={`w-9 h-9 rounded-full ${PANEL_META[aktif].bg} flex items-center justify-center text-xs font-bold ${PANEL_META[aktif].renk}`}>
                  {u.ad?.[0]}{u.soyad?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-800 text-sm">{isim}</p>
                    {ek && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${PANEL_META[aktif].bg} ${PANEL_META[aktif].renk} font-medium`}>{ek}</span>}
                    {"aktif" in u && !u.aktif && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">Pasif</span>}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{u.email ?? (u as Ogrenci).telefon ?? (u as Sahip).tcKimlik ?? "—"}</p>
                </div>
                <button onClick={() => gir(u)} disabled={gidiyor === u.id}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity disabled:opacity-50 ${
                    aktif === "muhasebe" ? "bg-blue-600" :
                    aktif === "kiralama" ? "bg-violet-600" :
                    aktif === "evSahibi" ? "bg-emerald-600" : "bg-orange-600"
                  }`}>
                  {gidiyor === u.id ? "Açılıyor..." : <><LogIn size={12} /> Panele Gir</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
