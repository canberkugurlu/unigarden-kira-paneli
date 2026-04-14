import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const panel       = searchParams.get("panel")       ?? undefined;
  const modul       = searchParams.get("modul")       ?? undefined;
  const eylem       = searchParams.get("eylem")       ?? undefined;
  const kullaniciId = searchParams.get("kullaniciId") ?? undefined;
  const fromStr     = searchParams.get("from");
  const toStr       = searchParams.get("to");
  const q           = searchParams.get("q")?.trim();
  const take        = Math.min(parseInt(searchParams.get("take") ?? "200", 10) || 200, 1000);

  const where: Record<string, unknown> = {};
  if (panel)       where.panel = panel;
  if (modul)       where.modul = modul;
  if (eylem)       where.eylem = eylem;
  if (kullaniciId) where.kullaniciId = kullaniciId;
  if (fromStr || toStr) {
    where.olusturmaTar = {
      ...(fromStr ? { gte: new Date(fromStr) } : {}),
      ...(toStr   ? { lte: new Date(toStr) }   : {}),
    };
  }
  if (q) {
    where.OR = [
      { baslik: { contains: q } },
      { detay:  { contains: q } },
      { kullaniciAd: { contains: q } },
      { targetId: { contains: q } },
    ];
  }

  const loglar = await prisma.islemLog.findMany({
    where,
    orderBy: { olusturmaTar: "desc" },
    take,
  });

  // Filter facets
  const [paneller, eylemler, moduller] = await Promise.all([
    prisma.islemLog.findMany({ select: { panel: true }, distinct: ["panel"] }),
    prisma.islemLog.findMany({ select: { eylem: true }, distinct: ["eylem"] }),
    prisma.islemLog.findMany({ select: { modul: true }, distinct: ["modul"] }),
  ]);

  return NextResponse.json({
    loglar,
    facets: {
      paneller: paneller.map(p => p.panel),
      eylemler: eylemler.map(e => e.eylem),
      moduller: moduller.map(m => m.modul),
    },
  });
}
