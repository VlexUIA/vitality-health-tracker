import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { today } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") || today();
  const entries = await prisma.waterEntry.findMany({
    where: { date },
    orderBy: { createdAt: "asc" },
  });
  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  return NextResponse.json({ entries, total });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const entry = await prisma.waterEntry.create({
    data: {
      date: body.date || today(),
      amount: Number(body.amount),
    },
  });
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));
  await prisma.waterEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
