import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Paralel olarak tüm tip kullanıcıları çek
  const [kullanicilar, daireSahipleri, ogrenciler] = await Promise.all([
    prisma.kullanici.findMany({
      select: { id: true, ad: true, soyad: true, email: true, rol: true, aktif: true, sonGiris: true },
      orderBy: { ad: "asc" },
    }),
    prisma.daireSahibi.findMany({
      select: { id: true, ad: true, soyad: true, email: true, tcKimlik: true, tip: true, unvan: true },
      orderBy: { ad: "asc" },
    }),
    prisma.ogrenci.findMany({
      select: { id: true, ad: true, soyad: true, email: true, telefon: true, tcKimlik: true },
      orderBy: { ad: "asc" },
      take: 500,
    }),
  ]);

  return NextResponse.json({
    // "Muhasebeci" rolündeki staff kullanıcılar muhasebe panele girer
    muhasebe: kullanicilar.filter(k => ["Muhasebeci", "Admin"].includes(k.rol)),
    kiralama: kullanicilar.filter(k => ["KiralamaSorumlusu", "Admin"].includes(k.rol)),
    evSahibi: daireSahipleri,
    kiraci:   ogrenciler,
  });
}
