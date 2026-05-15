import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { today } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") || today();

  const [calories, water, vitamins, sleep, energy, settings] = await Promise.all([
    prisma.calorieEntry.findMany({ where: { date } }),
    prisma.waterEntry.findMany({ where: { date } }),
    prisma.vitaminEntry.findMany({ where: { date } }),
    prisma.sleepEntry.findFirst({ where: { date } }),
    prisma.energyEntry.findMany({ where: { date }, orderBy: { createdAt: "desc" } }),
    prisma.settings.findFirst(),
  ]);

  const vitaminNames: string[] = settings ? JSON.parse(settings.vitamins) : ["Vitamin D", "Vitamin C", "Omega-3", "Magnesium"];

  return NextResponse.json({
    date,
    calories: {
      total: calories.reduce((s, e) => s + e.calories, 0),
      goal: settings?.calorieGoal ?? 2000,
    },
    water: {
      total: water.reduce((s, e) => s + e.amount, 0),
      goal: settings?.waterGoal ?? 2500,
    },
    protein: {
      total: Math.round(calories.reduce((s, e) => s + (e.protein ?? 0), 0)),
      goal: settings?.proteinGoal ?? 150,
    },
    vitamins: {
      taken: vitamins.filter((v) => v.taken).length,
      total: vitaminNames.length,
    },
    sleep: sleep ? { duration: sleep.duration, quality: sleep.quality } : null,
    energy: energy.length > 0 ? energy[0].level : null,
  });
}
