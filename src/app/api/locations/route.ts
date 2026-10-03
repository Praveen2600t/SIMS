import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: [{ district: "asc" }, { marketLocation: "asc" }],
      include: {
        _count: { select: { products: true } },
      },
    });
    return NextResponse.json({ data: locations });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
