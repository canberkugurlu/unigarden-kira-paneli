import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createImpersonationToken, PANEL_URLS, type ImpersonationPayload } from "@/lib/impersonate";
import { logIslem } from "@/lib/log";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const { targetUserId, targetType, targetPanel, targetAd } = body as {
    targetUserId: string;
    targetType: ImpersonationPayload["targetType"];
    targetPanel: ImpersonationPayload["targetPanel"];
    targetAd?: string;
  };

  if (!targetUserId || !targetType || !targetPanel) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }
  if (!(targetPanel in PANEL_URLS)) {
    return NextResponse.json({ error: "Geçersiz panel" }, { status: 400 });
  }

  const adminAd = `${session.ad} ${session.soyad}`;
  const token = await createImpersonationToken({
    targetUserId, targetType, targetPanel,
    adminId: session.id, adminAd,
  });

  // Log'la
  await logIslem({
    modul: "panellere-erisim",
    eylem: "CREATE",
    baslik: `Admin ${adminAd} → ${targetPanel} panelinde ${targetAd ?? targetUserId} olarak giriş yaptı`,
    detay: `Target: ${targetType} ${targetUserId}`,
    targetType, targetId: targetUserId,
  });

  const url = `${PANEL_URLS[targetPanel]}/api/auth/impersonate?token=${token}`;
  return NextResponse.json({ url });
}
