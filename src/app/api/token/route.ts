import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const c = await cookies();
  const token = c.get("access_token")?.value;

  return NextResponse.json({ token: token || null });
}
