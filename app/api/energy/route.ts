import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { today } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") || today();
  const entries = await prisma.energyEntry.findMany({
    where: { date },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const entry = await prisma.energyEntry.create({
    data: {
      date: body.date || today(),
      level: Number(body.level),
      note: body.note || null,
    },
  });
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));
  await prisma.energyEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
