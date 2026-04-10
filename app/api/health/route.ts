import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  try {
    const count = await Promise.race([
      prisma.konut.count(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("DB timeout after 5s")), 5000)
      ),
    ]);
    return NextResponse.json({ ok: true, db: dbUrl ? `${dbUrl.substring(0, 30)}...` : "NOT SET", count });
  } catch (e) {
    return NextResponse.json({ ok: false, db: dbUrl ? `${dbUrl.substring(0, 30)}...` : "NOT SET", error: String(e) }, { status: 500 });
  }
}
