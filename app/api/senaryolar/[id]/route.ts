import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const senaryo = await prisma.senaryo.findUnique({
    where: { id },
    include: {
      adimlar: { orderBy: { sira: "asc" } },
      akislar: { orderBy: { baslamaTar: "desc" }, take: 20 },
    },
  });
  if (!senaryo) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(senaryo);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const senaryo = await prisma.senaryo.update({
    where: { id },
    data: {
      ...(body.ad        !== undefined ? { ad: body.ad } : {}),
      ...(body.aciklama  !== undefined ? { aciklama: body.aciklama ?? null } : {}),
      ...(body.aktif     !== undefined ? { aktif: Boolean(body.aktif) } : {}),
    },
  });
  return NextResponse.json(senaryo);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.senaryo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
