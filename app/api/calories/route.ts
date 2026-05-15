import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { today } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") || today();
  const entries = await prisma.calorieEntry.findMany({
    where: { date },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const entry = await prisma.calorieEntry.create({
    data: {
      date: body.date || today(),
      meal: body.meal,
      calories: Number(body.calories),
      protein: body.protein ? Number(body.protein) : null,
      carbs: body.carbs ? Number(body.carbs) : null,
      fat: body.fat ? Number(body.fat) : null,
    },
  });
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));
  await prisma.calorieEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
