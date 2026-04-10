import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [toplamKonut, doluKonut, aktifSozlesme, toplamOgrenci, odemeler, giderler] =
    await Promise.all([
      prisma.konut.count(),
      prisma.konut.count({ where: { durum: "Dolu" } }),
      prisma.sozlesme.count({ where: { durum: "Aktif" } }),
      prisma.ogrenci.count(),
      prisma.odeme.aggregate({ _sum: { tutar: true } }),
      prisma.gider.aggregate({ _sum: { tutar: true } }),
    ]);

  const bosKonut = toplamKonut - doluKonut;
  const toplamGelir = odemeler._sum.tutar ?? 0;
  const toplamGider = giderler._sum.tutar ?? 0;

  return NextResponse.json({
    toplamKonut,
    doluKonut,
    bosKonut,
    aktifSozlesme,
    toplamOgrenci,
    toplamGelir,
    toplamGider,
    netGelir: toplamGelir - toplamGider,
  });
}
