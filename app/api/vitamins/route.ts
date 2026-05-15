import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { today } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") || today();

  const settings = await prisma.settings.findFirst();
  const vitaminNames: string[] = settings
    ? JSON.parse(settings.vitamins)
    : ["Vitamin D", "Vitamin C", "Omega-3", "Magnesium"];

  const existing = await prisma.vitaminEntry.findMany({ where: { date } });
  const existingMap = new Map(existing.map((e) => [e.name, e]));

  const vitamins = vitaminNames.map((name) => ({
    id: existingMap.get(name)?.id ?? null,
    name,
    taken: existingMap.get(name)?.taken ?? false,
  }));

  return NextResponse.json(vitamins);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const date = body.date || today();

  const existing = await prisma.vitaminEntry.findFirst({
    where: { date, name: body.name },
  });

  if (existing) {
    const updated = await prisma.vitaminEntry.update({
      where: { id: existing.id },
      data: { taken: body.taken },
    });
    return NextResponse.json(updated);
  }

  const entry = await prisma.vitaminEntry.create({
    data: { date, name: body.name, taken: body.taken },
  });
  return NextResponse.json(entry, { status: 201 });
}
