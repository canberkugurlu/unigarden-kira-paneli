import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { evSahibiId, sifre } = await req.json();
  if (!evSahibiId || !sifre || sifre.length < 6) {
    return NextResponse.json({ error: "En az 6 karakterli şifre gerekli" }, { status: 400 });
  }
  const hash = await bcrypt.hash(sifre, 10);
  await prisma.daireSahibi.update({ where: { id: evSahibiId }, data: { sifre: hash } });
  return NextResponse.json({ ok: true });
}
