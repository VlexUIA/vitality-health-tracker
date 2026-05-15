import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { today } from "@/lib/utils";

// Called by iOS Shortcuts to push Apple Watch / HealthKit data
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate API key
  const settings = await prisma.settings.findFirst();
  if (settings?.apiKey && body.apiKey !== settings.apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = body.date || today();
  const results: Record<string, unknown> = {};

  if (body.sleep) {
    const { bedtime, wakeTime, duration, quality } = body.sleep;
    const existing = await prisma.sleepEntry.findFirst({ where: { date } });
    if (existing) {
      results.sleep = await prisma.sleepEntry.update({
        where: { id: existing.id },
        data: { bedtime, wakeTime, duration: Number(duration), quality: Number(quality ?? 3), fromWatch: true },
      });
    } else {
      results.sleep = await prisma.sleepEntry.create({
        data: { date, bedtime, wakeTime, duration: Number(duration), quality: Number(quality ?? 3), fromWatch: true },
      });
    }
  }

  if (body.water) {
    results.water = await prisma.waterEntry.create({
      data: { date, amount: Number(body.water) },
    });
  }

  if (body.energy) {
    results.energy = await prisma.energyEntry.create({
      data: { date, level: Number(body.energy), note: "From Apple Watch" },
    });
  }

  return NextResponse.json({ ok: true, results });
}
