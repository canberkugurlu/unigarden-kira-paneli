"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, Building2, Phone, Mail, ChevronRight,
  Calendar, Coins, AlertCircle, Home, History,
} from "lucide-react";

interface KonutLite {
  id: string; daireNo: string; blok: string; etap: number; katNo: number; tip: string;
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
  konut: KonutLite;
}
interface DaireSahibi {
  id: string;
  tip?: "Bireysel" | "Kurumsal";
  ad: string; soyad: string;
  tcKimlik?: string | null;
  vergiNo?: string | null;
  unvan?: string | null;
  telefon: string;
  email?: string | null;
  notlar?: string | null;
  konutlar: KonutLite[];
  sahiplikler?: SahiplikKaydi[];
}

const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString("tr-TR") : "—";
const para = (n?: number | null) => n != null ? `₺${n.toLocaleString("tr-TR")}` : "—";

export default function DaireSahibiDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [s, setS] = useState<DaireSahibi | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/daire-sahipleri/${id}`).then(r => r.ok ? r.json() : null).then(d => { setS(d); setYukleniyor(false); });
  }, [id]);

  if (yukleniyor) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!s) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
      <AlertCircle size={32} /><p>Daire sahibi bulunamadı.</p>
      <button onClick={() => router.back()} className="text-emerald-600 text-sm hover:underline">Geri dön</button>
    </div>
  );

  const kurumsal = s.tip === "Kurumsal";
  const aktif   = (s.sahiplikler ?? []).filter(x => !x.satisTarihi);
  const gecmis  = (s.sahiplikler ?? []).filter(x =>  x.satisTarihi);
  const toplamAlis  = (s.sahiplikler ?? []).reduce((a, x) => a + (x.alisFiyati  ?? 0), 0);
  const toplamSatis = (s.sahiplikler ?? []).reduce((a, x) => a + (x.satisFiyati ?? 0), 0);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => router.push("/daire-sahipleri")} className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
          <ArrowLeft size={15} /> Daire Sahipleri
        </button>
        <ChevronRight size={13} />
        <span className="text-gray-800 font-medium">{kurumsal ? (s.unvan ?? s.ad) : `${s.ad} ${s.soyad}`}</span>
      </div>

      {/* Hero Kart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className={`h-2 ${kurumsal ? "bg-blue-500" : "bg-emerald-500"}`} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${kurumsal ? "bg-blue-600" : "bg-emerald-600"} flex items-center justify-center shrink-0`}>
                {kurumsal ? <Building2 size={28} className="text-white" /> : <User size={28} className="text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900">
                    {kurumsal ? (s.unvan ?? s.ad) : `${s.ad} ${s.soyad}`}
                  </h1>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${kurumsal ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {kurumsal ? "Kurumsal" : "Bireysel"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {kurumsal ? (s.vergiNo ? `VNO: ${s.vergiNo}` : "Vergi No yok") : (s.tcKimlik ? `TC: ${s.tcKimlik}` : "TC Kimlik yok")}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1 flex-wrap">
                  {s.telefon && <span className="flex items-center gap-1"><Phone size={12} /> {s.telefon}</span>}
                  {s.email && <span className="flex items-center gap-1"><Mail size={12} /> {s.email}</span>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <p className={`text-xl font-bold ${kurumsal ? "text-blue-600" : "text-emerald-600"}`}>{s.konutlar.length}</p>
                <p className="text-xs text-gray-400">Aktif Daire</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-700">{s.sahiplikler?.length ?? 0}</p>
                <p className="text-xs text-gray-400">Toplam Kayıt</p>
              </div>
              {toplamAlis > 0 && (
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-700">{para(toplamAlis)}</p>
                  <p className="text-xs text-gray-400">Toplam Alış</p>
                </div>
              )}
              {toplamSatis > 0 && (
                <div className="text-center">
                  <p className="text-xl font-bold text-orange-600">{para(toplamSatis)}</p>
                  <p className="text-xs text-gray-400">Toplam Satış</p>
                </div>
              )}
            </div>
          </div>

          {s.notlar && (
            <div className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{s.notlar}</div>
          )}
        </div>
      </div>

      {/* Aktif Daireler */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
          <Home size={15} className="text-emerald-500" />
          <h2 className="font-semibold text-gray-800 text-sm">Aktif Daireler ({aktif.length})</h2>
        </div>
        {aktif.length === 0 ? (
          <p className="text-center py-8 text-sm text-gray-400 italic">Aktif sahiplik yok</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {aktif.map(k => (
              <button key={k.id} onClick={() => router.push(`/konutlar/${k.konut.id}`)}
                className="w-full text-left flex items-center justify-between px-5 py-3 hover:bg-emerald-50/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{k.konut.blok}</span>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-gray-800 text-sm">{k.konut.daireNo}</p>
                      {k.ipotekli && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">İpotekli</span>}
                      {k.pay && k.payda && k.payda > 1 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">{k.pay}/{k.payda} Hisse</span>}
                    </div>
                    <p className="text-xs text-gray-500">{k.konut.etap}. Etap · {k.konut.katNo}. Kat · {k.konut.tip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar size={11} /> {fmt(k.alisTarihi)}</span>
                  {k.alisFiyati != null && <span className="flex items-center gap-1 text-xs text-gray-700"><Coins size={11} /> {para(k.alisFiyati)}</span>}
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Satıştan Çıkan Daireler (geçmiş) */}
      {gecmis.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            <History size={15} className="text-gray-400" />
            <h2 className="font-semibold text-gray-800 text-sm">Satış Geçmişi ({gecmis.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {gecmis.map(k => (
              <button key={k.id} onClick={() => router.push(`/konutlar/${k.konut.id}`)}
                className="w-full text-left flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">{k.konut.blok}</span>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">{k.konut.daireNo}</p>
                    <p className="text-xs text-gray-500">{k.konut.etap}. Etap · {k.konut.katNo}. Kat</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{fmt(k.alisTarihi)} → {fmt(k.satisTarihi)}</span>
                  {k.alisFiyati != null && <span className="text-gray-600">A: {para(k.alisFiyati)}</span>}
                  {k.satisFiyati != null && <span className="text-orange-600">S: {para(k.satisFiyati)}</span>}
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
