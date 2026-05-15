import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const items = await prisma.customStimulant.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.customStimulant.create({
    data: {
      name: body.name,
      caffeineMg: Number(body.caffeineMg),
      durationHours: Number(body.durationHours),
    },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));
  await prisma.customStimulant.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
