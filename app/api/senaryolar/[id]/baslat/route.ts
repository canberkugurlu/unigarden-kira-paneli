import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logIslem } from "@/lib/log";

/** Senaryoyu belirli bir hedef üzerinde başlat. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { baslik, hedefId, notlar } = body as { baslik?: string; hedefId?: string; notlar?: string };

  const senaryo = await prisma.senaryo.findUnique({
    where: { id }, include: { adimlar: { orderBy: { sira: "asc" } } },
  });
  if (!senaryo) return NextResponse.json({ error: "Senaryo bulunamadı" }, { status: 404 });
  if (!senaryo.aktif) return NextResponse.json({ error: "Senaryo pasif" }, { status: 400 });
  if (senaryo.adimlar.length === 0) return NextResponse.json({ error: "Senaryoda adım yok" }, { status: 400 });

  const akis = await prisma.senaryoAkisi.create({
    data: {
      senaryoId: id,
      baslik: baslik ?? `${senaryo.ad} — ${new Date().toLocaleString("tr-TR")}`,
      hedefModel: senaryo.hedefModel,
      hedefId: hedefId ?? null,
      baslayanId: session.id,
      baslayanAd: `${session.ad} ${session.soyad}`,
      aktifSira: 1,
      notlar: notlar ?? null,
      adimlar: {
        create: senaryo.adimlar.map((a, i) => ({
          adimId: a.id, sira: a.sira,
          durum: i === 0 ? "Aktif" : "Beklemede",
        })),
      },
    },
    include: { adimlar: { include: { adim: true }, orderBy: { sira: "asc" } } },
  });

  await logIslem({
    modul: "senaryo-akis", eylem: "CREATE",
    baslik: `Senaryo başlatıldı: ${senaryo.ad}`,
    detay: akis.baslik,
    targetType: "SenaryoAkisi", targetId: akis.id,
  });

  return NextResponse.json(akis);
}
