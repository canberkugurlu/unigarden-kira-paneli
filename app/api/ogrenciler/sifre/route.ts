import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/ogrenciler/sifre  { ogrenciId, sifre }
export async function POST(req: Request) {
  const { ogrenciId, sifre } = await req.json();
  if (!ogrenciId || !sifre || sifre.length < 6) {
    return NextResponse.json({ error: "En az 6 karakterli şifre gerekli" }, { status: 400 });
  }
  const hash = await bcrypt.hash(sifre, 10);
  await prisma.ogrenci.update({ where: { id: ogrenciId }, data: { sifre: hash } });
  return NextResponse.json({ ok: true });
}
