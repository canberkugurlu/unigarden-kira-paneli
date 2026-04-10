export const dynamic = "force-dynamic";

import { Building2, Users, FileText, TrendingUp, TrendingDown, Wallet, Wrench, Megaphone, ChevronRight } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

async function getIstatistikler() {
  const [toplamKonut, doluKonut, aktifSozlesme, toplamOgrenci, odemeler, giderler] =
    await Promise.all([
      prisma.konut.count(),
      prisma.konut.count({ where: { durum: "Dolu" } }),
      prisma.sozlesme.count({ where: { durum: "Aktif" } }),
      prisma.ogrenci.count(),
      prisma.odeme.aggregate({ _sum: { tutar: true } }),
      prisma.gider.aggregate({ _sum: { tutar: true } }),
    ]);

  return {
    toplamKonut,
    doluKonut,
    bosKonut: toplamKonut - doluKonut,
    aktifSozlesme,
    toplamOgrenci,
    toplamGelir: odemeler._sum.tutar ?? 0,
    toplamGider: giderler._sum.tutar ?? 0,
    netGelir: (odemeler._sum.tutar ?? 0) - (giderler._sum.tutar ?? 0),
  };
}

async function getBakimOzeti() {
  const [bekliyor, islemde, tamamlandi, sonTalepler] = await Promise.all([
    prisma.bakimTalebi.count({ where: { durum: "Bekliyor" } }),
    prisma.bakimTalebi.count({ where: { durum: "Islemde" } }),
    prisma.bakimTalebi.count({ where: { durum: "Tamamlandi" } }),
    prisma.bakimTalebi.findMany({
      where: { durum: { in: ["Bekliyor", "Islemde"] } },
      orderBy: { olusturmaTar: "desc" },
      take: 5,
      include: {
        ogrenci: { select: { ad: true, soyad: true } },
        konut: { select: { daireNo: true } },
      },
    }),
  ]);
  return { bekliyor, islemde, tamamlandi, sonTalepler };
}

async function getDuyurularOzeti() {
  const [toplam, yayinda, sonDuyurular] = await Promise.all([
    prisma.duyuru.count(),
    prisma.duyuru.count({ where: { yayinda: true } }),
    prisma.duyuru.findMany({
      orderBy: { tarih: "desc" },
      take: 4,
    }),
  ]);
  return { toplam, yayinda, sonDuyurular };
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const DURUM_RENK: Record<string, string> = {
  Bekliyor: "bg-yellow-100 text-yellow-700",
  Islemde: "bg-blue-100 text-blue-700",
  Tamamlandi: "bg-green-100 text-green-700",
  Iptal: "bg-gray-100 text-gray-500",
};
const DURUM_LABEL: Record<string, string> = { Bekliyor: "Bekliyor", Islemde: "İşlemde", Tamamlandi: "Tamamlandı", Iptal: "İptal" };

export default async function Dashboard() {
  const [stats, bakim, duyurular] = await Promise.all([
    getIstatistikler(),
    getBakimOzeti(),
    getDuyurularOzeti(),
  ]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);

  return (
    <div className="space-y-6">
      {/* Stat kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Toplam Konut" value={stats.toplamKonut} icon={Building2} color="bg-blue-500" sub={`${stats.doluKonut} dolu • ${stats.bosKonut} boş`} />
        <StatCard label="Toplam Kiracı" value={stats.toplamOgrenci} icon={Users} color="bg-violet-500" />
        <StatCard label="Aktif Sözleşme" value={stats.aktifSozlesme} icon={FileText} color="bg-emerald-500" />
        <StatCard label="Toplam Gelir" value={fmt(stats.toplamGelir)} icon={TrendingUp} color="bg-green-500" />
        <StatCard label="Toplam Gider" value={fmt(stats.toplamGider)} icon={TrendingDown} color="bg-red-500" />
        <StatCard label="Net Gelir" value={fmt(stats.netGelir)} icon={Wallet} color={stats.netGelir >= 0 ? "bg-teal-500" : "bg-orange-500"} />
      </div>

      {/* Alt satır: Bakım + Duyurular */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bakım Talepleri Özeti */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Wrench size={17} className="text-orange-500" />
              <h3 className="font-semibold text-gray-700">Bakım Talepleri</h3>
            </div>
            <Link href="/bakim-talepleri" className="flex items-center gap-0.5 text-xs text-emerald-600 hover:text-emerald-700">
              Tümü <ChevronRight size={13} />
            </Link>
          </div>

          {/* Sayaçlar */}
          <div className="grid grid-cols-3 divide-x divide-gray-50 border-b border-gray-50">
            {[
              { label: "Bekliyor", value: bakim.bekliyor, color: "text-yellow-600" },
              { label: "İşlemde", value: bakim.islemde, color: "text-blue-600" },
              { label: "Tamamlandı", value: bakim.tamamlandi, color: "text-green-600" },
            ].map(c => (
              <div key={c.label} className="text-center py-3">
                <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Son açık talepler */}
          <div className="flex-1 divide-y divide-gray-50">
            {bakim.sonTalepler.length === 0 ? (
              <p className="text-xs text-gray-300 italic text-center py-6">Açık talep yok</p>
            ) : (
              bakim.sonTalepler.map(t => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{t.baslik}</p>
                    <p className="text-xs text-gray-400">{t.ogrenci.ad} {t.ogrenci.soyad} · Daire {t.konut.daireNo}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DURUM_RENK[t.durum] ?? "bg-gray-100 text-gray-500"}`}>
                    {DURUM_LABEL[t.durum] ?? t.durum}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Duyurular Özeti */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Megaphone size={17} className="text-purple-500" />
              <h3 className="font-semibold text-gray-700">Duyurular</h3>
            </div>
            <Link href="/duyurular" className="flex items-center gap-0.5 text-xs text-emerald-600 hover:text-emerald-700">
              Tümü <ChevronRight size={13} />
            </Link>
          </div>

          {/* Sayaçlar */}
          <div className="grid grid-cols-2 divide-x divide-gray-50 border-b border-gray-50">
            {[
              { label: "Toplam", value: duyurular.toplam, color: "text-gray-700" },
              { label: "Yayında", value: duyurular.yayinda, color: "text-purple-600" },
            ].map(c => (
              <div key={c.label} className="text-center py-3">
                <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Son duyurular */}
          <div className="flex-1 divide-y divide-gray-50">
            {duyurular.sonDuyurular.length === 0 ? (
              <p className="text-xs text-gray-300 italic text-center py-6">Henüz duyuru yok</p>
            ) : (
              duyurular.sonDuyurular.map(d => (
                <div key={d.id} className="flex items-start justify-between px-5 py-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{d.baslik}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(d.tarih), "d MMM yyyy", { locale: tr })} · {d.hedef}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${d.yayinda ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-400"}`}>
                    {d.yayinda ? "Yayında" : "Taslak"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Hızlı İşlemler */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">Hızlı İşlemler</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/konutlar", label: "Yeni Konut Ekle" },
            { href: "/ogrenciler", label: "Yeni Kiracı" },
            { href: "/sozlesmeler/yeni", label: "Yeni Sözleşme" },
            { href: "/gelirler", label: "Gelir Girişi" },
            { href: "/giderler", label: "Gider Girişi" },
            { href: "/tedarikciler", label: "Yeni Tedarikçi" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
