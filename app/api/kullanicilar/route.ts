import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const kullanicilar = await prisma.kullanici.findMany({
    select: {
      id: true, ad: true, soyad: true, email: true,
      rol: true, telefon: true, aktif: true, notlar: true,
      sonGiris: true, olusturmaTar: true,
      // sifre dönmez
    },
    orderBy: [{ rol: "asc" }, { ad: "asc" }],
  });
  return NextResponse.json(kullanicilar);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const sifreHash = await bcrypt.hash(body.sifre, 10);
  const kullanici = await prisma.kullanici.create({
    data: {
      ad: body.ad,
      soyad: body.soyad,
      email: body.email,
      sifre: sifreHash,
      rol: body.rol,
      telefon: body.telefon ?? null,
      notlar: body.notlar ?? null,
    },
    select: {
      id: true, ad: true, soyad: true, email: true,
      rol: true, telefon: true, aktif: true, olusturmaTar: true,
    },
  });
  return NextResponse.json(kullanici);
}
