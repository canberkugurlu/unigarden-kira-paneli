import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const senaryolar = await prisma.senaryo.findMany({
    include: { adimlar: { orderBy: { sira: "asc" } }, _count: { select: { akislar: true } } },
    orderBy: { olusturmaTar: "desc" },
  });
  return NextResponse.json(senaryolar);
}

interface YeniAdim { sira: number; ad: string; aciklama?: string; panel: string; rol?: string; aksiyon: string }

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const { ad, aciklama, hedefModel, tetikleyici, adimlar }: {
    ad: string; aciklama?: string; hedefModel: string; tetikleyici?: string; adimlar: YeniAdim[];
  } = body;

  if (!ad || !hedefModel || !Array.isArray(adimlar) || adimlar.length === 0) {
    return NextResponse.json({ error: "Ad, hedefModel ve en az 1 adım gereklidir" }, { status: 400 });
  }

  const senaryo = await prisma.senaryo.create({
    data: {
      ad, aciklama: aciklama ?? null, hedefModel,
      tetikleyici: tetikleyici ?? "manuel",
      olusturanId: session.id,
      olusturanAd: `${session.ad} ${session.soyad}`,
      adimlar: {
        create: adimlar.map(a => ({
          sira: a.sira,
          ad: a.ad,
          aciklama: a.aciklama ?? null,
          panel: a.panel,
          rol: a.rol ?? null,
          aksiyon: a.aksiyon,
        })),
      },
    },
    include: { adimlar: { orderBy: { sira: "asc" } } },
  });
  return NextResponse.json(senaryo);
}
