import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ rolId: string }> }
) {
  const { rolId } = await params;
  const kayit = await prisma.kullaniciIzin.findUnique({
    where: { kullaniciTip_kullaniciId: { kullaniciTip: "Rol", kullaniciId: rolId } },
  });
  return NextResponse.json(kayit ?? null);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ rolId: string }> }
) {
  const { rolId } = await params;
  const body = await req.json();
  const kayit = await prisma.kullaniciIzin.upsert({
    where: { kullaniciTip_kullaniciId: { kullaniciTip: "Rol", kullaniciId: rolId } },
    update: { izinler: body.izinler, guncelleTar: new Date() },
    create: { kullaniciTip: "Rol", kullaniciId: rolId, izinler: body.izinler },
  });
  return NextResponse.json(kayit);
}
