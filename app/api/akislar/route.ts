import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const durum = searchParams.get("durum") ?? undefined;
  const akislar = await prisma.senaryoAkisi.findMany({
    where: durum ? { durum } : undefined,
    include: {
      senaryo: { select: { ad: true, hedefModel: true } },
      adimlar: {
        include: { adim: { select: { ad: true, panel: true, rol: true, aksiyon: true } } },
        orderBy: { sira: "asc" },
      },
    },
    orderBy: { baslamaTar: "desc" },
    take: 200,
  });
  return NextResponse.json(akislar);
}
