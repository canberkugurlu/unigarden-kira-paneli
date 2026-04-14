import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const log = await prisma.islemLog.findUnique({ where: { id } });
  if (!log) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(log);
}
