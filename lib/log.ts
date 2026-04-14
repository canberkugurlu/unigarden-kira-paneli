import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export interface LogParams {
  panel?: string;             // default "kira"
  modul: string;
  eylem: "CREATE" | "UPDATE" | "DELETE" | "BULK_IMPORT" | "BULK_DELETE";
  baslik: string;
  detay?: string;
  targetType?: string;
  targetId?: string;
  oncekiVeri?: unknown;
  sonrakiVeri?: unknown;
}

export async function logIslem(p: LogParams): Promise<void> {
  try {
    const session = await getSession().catch(() => null);
    await prisma.islemLog.create({
      data: {
        panel:        p.panel ?? "kira",
        modul:        p.modul,
        eylem:        p.eylem,
        baslik:       p.baslik,
        detay:        p.detay        ?? null,
        targetType:   p.targetType   ?? null,
        targetId:     p.targetId     ?? null,
        oncekiVeri:   p.oncekiVeri   != null ? JSON.stringify(p.oncekiVeri)   : null,
        sonrakiVeri:  p.sonrakiVeri  != null ? JSON.stringify(p.sonrakiVeri)  : null,
        kullaniciId:  session?.id    ?? null,
        kullaniciAd:  session ? `${session.ad} ${session.soyad}` : null,
        kullaniciTip: "Admin",
      },
    });
  } catch (e) {
    console.error("[islemLog] kaydedilemedi:", e instanceof Error ? e.message : e);
  }
}
