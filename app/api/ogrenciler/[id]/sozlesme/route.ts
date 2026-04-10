import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sozlesmeler = await prisma.sozlesme.findMany({
    where: { ogrenciId: id, durum: "Aktif" },
    include: { konut: { select: { id: true, blok: true, daireNo: true, etap: true, tip: true } } },
    orderBy: { olusturmaTar: "desc" },
  });
  return NextResponse.json(sozlesmeler);
}
