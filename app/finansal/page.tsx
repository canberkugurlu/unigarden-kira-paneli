export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { TrendingUp, TrendingDown, Wallet, Building2 } from "lucide-react";

async function getData() {
  const [odemeler, giderler, konutlar, sozlesmeler] = await Promise.all([
    prisma.odeme.findMany({ orderBy: { odenmeTarihi: "desc" } }),
    prisma.gider.findMany({ orderBy: { tarih: "desc" } }),
    prisma.konut.findMany(),
    prisma.sozlesme.findMany({ where: { durum: "Aktif" } }),
  ]);
  return { odemeler, giderler, konutlar, sozlesmeler };
}

export default async function FinansalPage() {
  const { odemeler, giderler, konutlar, sozlesmeler } = await getData();

  const toplamGelir = odemeler.reduce((s, o) => s + o.tutar, 0);
  const toplamGider = giderler.reduce((s, g) => s + g.tutar, 0);
  const netGelir = toplamGelir - toplamGider;
  const dolulukOrani = konutlar.length > 0
    ? Math.round((konutlar.filter(k => k.durum === "Dolu").length / konutlar.length) * 100)
    : 0;

  const fmt = (n: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);

  const kartlar = [
    { label: "Toplam Gelir", value: fmt(toplamGelir), icon: TrendingUp, color: "bg-green-500", textColor: "text-green-600" },
    { label: "Toplam Gider", value: fmt(toplamGider), icon: TrendingDown, color: "bg-red-500", textColor: "text-red-600" },
    { label: "Net Gelir", value: fmt(netGelir), icon: Wallet, color: netGelir >= 0 ? "bg-teal-500" : "bg-orange-500", textColor: netGelir >= 0 ? "text-teal-600" : "text-orange-600" },
    { label: "Doluluk Oranı", value: `%${dolulukOrani}`, icon: Building2, color: "bg-blue-500", textColor: "text-blue-600" },
  ];

  const kategoriBazliGelir = odemeler.reduce((acc, o) => {
    acc[o.tip] = (acc[o.tip] ?? 0) + o.tutar;
    return acc;
  }, {} as Record<string, number>);

  const kategoriBazliGider = giderler.reduce((acc, g) => {
    const label = { Bakim: "Bakım", Onarim: "Onarım", Fatura: "Fatura", Yonetim: "Yönetim", Diger: "Diğer" }[g.kategori] ?? g.kategori;
    acc[label] = (acc[label] ?? 0) + g.tutar;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kartlar.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${color}`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-base font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Gelir Dağılımı</h3>
          <div className="space-y-3">
            {Object.entries(kategoriBazliGelir).map(([tip, tutar]) => (
              <div key={tip} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600">{tip}</span>
                </div>
                <span className="text-sm font-semibold text-green-600">{fmt(tutar)}</span>
              </div>
            ))}
            {Object.keys(kategoriBazliGelir).length === 0 && (
              <p className="text-sm text-gray-400">Gelir verisi yok</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Gider Dağılımı</h3>
          <div className="space-y-3">
            {Object.entries(kategoriBazliGider).map(([kat, tutar]) => (
              <div key={kat} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-600">{kat}</span>
                </div>
                <span className="text-sm font-semibold text-red-600">{fmt(tutar)}</span>
              </div>
            ))}
            {Object.keys(kategoriBazliGider).length === 0 && (
              <p className="text-sm text-gray-400">Gider verisi yok</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">Aktif Sözleşme Özeti</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">{konutlar.length}</p>
            <p className="text-xs text-gray-500 mt-1">Toplam Konut</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{konutlar.filter(k => k.durum === "Dolu").length}</p>
            <p className="text-xs text-gray-500 mt-1">Dolu Konut</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{sozlesmeler.length}</p>
            <p className="text-xs text-gray-500 mt-1">Aktif Sözleşme</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-700">
              {fmt(sozlesmeler.reduce((s, sz) => s + sz.aylikKira, 0))}
            </p>
            <p className="text-xs text-gray-500 mt-1">Aylık Kira Geliri</p>
          </div>
        </div>
      </div>
    </div>
  );
}
