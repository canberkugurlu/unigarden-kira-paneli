import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  return NextResponse.json({
    ok: true,
    db: dbUrl ? `${dbUrl.substring(0, 30)}...` : "NOT SET",
  });
}
