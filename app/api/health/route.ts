import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  try {
    const count = await prisma.konut.count();
    return NextResponse.json({ ok: true, db: dbUrl ? `${dbUrl.substring(0, 40)}...` : "NOT SET", count });
  } catch (e: unknown) {
    const err = e instanceof Error ? { message: e.message, stack: e.stack?.substring(0, 500) } : String(e);
    return NextResponse.json({ ok: false, db: dbUrl ? `${dbUrl.substring(0, 40)}...` : "NOT SET", error: err }, { status: 500 });
  }
}
