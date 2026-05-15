import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { today } from "@/lib/utils";

// GET — connectivity test used by the Settings page
export async function GET() {
  return NextResponse.json({ ok: true, message: "Sync endpoint reachable" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const settings = await prisma.settings.findFirst();
  if (settings?.apiKey && body.apiKey !== settings.apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = body.date || today();
  const results: Record<string, unknown> = {};

  // --- Sleep (upsert) ---
  if (body.sleep) {
    const { bedtime, wakeTime, duration, quality, deepMins, remMins, totalMins } = body.sleep;

    // Derive quality from Apple Watch sleep stages if explicit quality not provided
    let resolvedQuality = quality != null ? Number(quality) : 3;
    if (quality == null && deepMins != null && remMins != null && totalMins != null) {
      const pct = ((Number(deepMins) + Number(remMins)) / Number(totalMins)) * 100;
      if (pct >= 30) resolvedQuality = 5;
      else if (pct >= 25) resolvedQuality = 4;
      else if (pct >= 20) resolvedQuality = 3;
      else if (pct >= 15) resolvedQuality = 2;
      else resolvedQuality = 1;
    }

    const sleepData = {
      bedtime: bedtime ?? "00:00",
      wakeTime: wakeTime ?? "00:00",
      duration: Number(duration),
      quality: resolvedQuality,
      fromWatch: true,
    };

    const existing = await prisma.sleepEntry.findFirst({ where: { date } });
    results.sleep = existing
      ? await prisma.sleepEntry.update({ where: { id: existing.id }, data: sleepData })
      : await prisma.sleepEntry.create({ data: { date, ...sleepData } });
  }

  // --- Calories + Protein (upsert via meal="Apple Health") ---
  if (body.calories != null) {
    const calories = Number(body.calories);
    const protein = body.protein != null ? Number(body.protein) : null;
    const existing = await prisma.calorieEntry.findFirst({ where: { date, meal: "Apple Health" } });
    results.calories = existing
      ? await prisma.calorieEntry.update({
          where: { id: existing.id },
          data: { calories, ...(protein != null && { protein }) },
        })
      : await prisma.calorieEntry.create({
          data: { date, meal: "Apple Health", calories, protein },
        });
  }

  // --- Water (additive — call once per glass / increment) ---
  if (body.water != null) {
    results.water = await prisma.waterEntry.create({
      data: { date, amount: Number(body.water) },
    });
  }

  return NextResponse.json({ ok: true, synced: Object.keys(results), results });
}
