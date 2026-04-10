import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ tip: string; id: string }> }) {
  const { tip, id } = await params;
  const izin = await prisma.kullaniciIzin.findUnique({
    where: { kullaniciTip_kullaniciId: { kullaniciTip: tip, kullaniciId: id } },
  });
  return NextResponse.json(izin ?? { kullaniciTip: tip, kullaniciId: id, izinler: "{}" });
}

export async function PUT(req: Request, { params }: { params: Promise<{ tip: string; id: string }> }) {
  const { tip, id } = await params;
  const body = await req.json();
  const izinler = typeof body.izinler === "string" ? body.izinler : JSON.stringify(body.izinler);

  const izin = await prisma.kullaniciIzin.upsert({
    where: { kullaniciTip_kullaniciId: { kullaniciTip: tip, kullaniciId: id } },
    update: { izinler, guncelleTar: new Date() },
    create: { kullaniciTip: tip, kullaniciId: id, izinler },
  });
  return NextResponse.json(izin);
}
