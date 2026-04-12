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
  const data: Record<string, unknown> = {};
  ["tip","ad","soyad","telefon","email","notlar","tcKimlik","vergiNo","unvan"].forEach(k => {
    if (body[k] !== undefined) data[k] = body[k] === "" ? null : body[k];
  });
  const sahibi = await prisma.daireSahibi.update({ where: { id }, data });
  return NextResponse.json(sahibi);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.daireSahibi.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
