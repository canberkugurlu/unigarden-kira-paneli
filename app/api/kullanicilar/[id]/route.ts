import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.ad !== undefined)      data.ad = body.ad;
  if (body.soyad !== undefined)   data.soyad = body.soyad;
  if (body.email !== undefined)   data.email = body.email;
  if (body.rol !== undefined)     data.rol = body.rol;
  if (body.telefon !== undefined) data.telefon = body.telefon;
  if (body.aktif !== undefined)   data.aktif = body.aktif;
  if (body.notlar !== undefined)  data.notlar = body.notlar;
  if (body.sifre) {
    data.sifre = await bcrypt.hash(body.sifre, 10);
  }

  const kullanici = await prisma.kullanici.update({
    where: { id },
    data,
    select: {
      id: true, ad: true, soyad: true, email: true,
      rol: true, telefon: true, aktif: true, olusturmaTar: true,
    },
  });
  return NextResponse.json(kullanici);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.kullanici.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
