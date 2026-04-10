import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sozlesme = await prisma.sozlesme.findUnique({
    where: { id },
    include: { konut: true, ogrenci: true, odemeler: true },
  });
  if (!sozlesme) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(sozlesme);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const sozlesme = await prisma.sozlesme.update({
    where: { id },
    data: body,
    include: { konut: true, ogrenci: true },
  });
  if (body.durum && body.durum !== "Aktif") {
    await prisma.konut.update({ where: { id: sozlesme.konutId }, data: { durum: "Bos" } });
  }
  return NextResponse.json(sozlesme);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sozlesme = await prisma.sozlesme.findUnique({ where: { id } });
  if (sozlesme) {
    await prisma.sozlesme.delete({ where: { id } });
    await prisma.konut.update({ where: { id: sozlesme.konutId }, data: { durum: "Bos" } });
  }
  return NextResponse.json({ success: true });
}
