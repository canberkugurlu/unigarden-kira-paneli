import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sahibi = await prisma.daireSahibi.findUnique({
    where: { id },
    include: { konutlar: { orderBy: { daireNo: "asc" } } },
  });
  if (!sahibi) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(sahibi);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const norm = (v: unknown) => v === "" ? null : v;
  const sahibi = await prisma.daireSahibi.update({
    where: { id },
    data: {
      ...(body.tip      !== undefined ? { tip:      body.tip as string } : {}),
      ...(body.ad       !== undefined ? { ad:       body.ad } : {}),
      ...(body.soyad    !== undefined ? { soyad:    body.soyad } : {}),
      ...(body.telefon  !== undefined ? { telefon:  body.telefon } : {}),
      ...(body.email    !== undefined ? { email:    norm(body.email)    as string | null } : {}),
      ...(body.notlar   !== undefined ? { notlar:   norm(body.notlar)   as string | null } : {}),
      ...(body.tcKimlik !== undefined ? { tcKimlik: norm(body.tcKimlik) as string | null } : {}),
      ...(body.vergiNo  !== undefined ? { vergiNo:  norm(body.vergiNo)  as string | null } : {}),
      ...(body.unvan    !== undefined ? { unvan:    norm(body.unvan)    as string | null } : {}),
    },
  });
  return NextResponse.json(sahibi);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.daireSahibi.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
