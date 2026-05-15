import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { today } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") || today();
  const entry = await prisma.sleepEntry.findFirst({ where: { date } });
  return NextResponse.json(entry);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const date = body.date || today();

  const existing = await prisma.sleepEntry.findFirst({ where: { date } });
  if (existing) {
    const updated = await prisma.sleepEntry.update({
      where: { id: existing.id },
      data: {
        bedtime: body.bedtime,
        wakeTime: body.wakeTime,
        duration: Number(body.duration),
        quality: Number(body.quality),
        fromWatch: body.fromWatch ?? false,
      },
    });
    return NextResponse.json(updated);
  }

  const entry = await prisma.sleepEntry.create({
    data: {
      date,
      bedtime: body.bedtime,
      wakeTime: body.wakeTime,
      duration: Number(body.duration),
      quality: Number(body.quality),
      fromWatch: body.fromWatch ?? false,
    },
  });
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));
  await prisma.sleepEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
