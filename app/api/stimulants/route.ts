import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { today } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") || today();
  const entries = await prisma.stimulantEntry.findMany({
    where: { date },
    orderBy: { time: "asc" },
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const entry = await prisma.stimulantEntry.create({
    data: {
      date: body.date || today(),
      time: body.time,
      name: body.name,
      caffeineMg: Number(body.caffeineMg),
      durationHours: Number(body.durationHours),
    },
  });
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));
  await prisma.stimulantEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
