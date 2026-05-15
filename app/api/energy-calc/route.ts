import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { today } from "@/lib/utils";
import { calcEnergy } from "@/lib/energy-calc";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") || today();
  const nowHHMM = req.nextUrl.searchParams.get("now") || format(new Date(), "HH:mm");

  const [calories, protein, sleep, stimulants, settings] = await Promise.all([
    prisma.calorieEntry.findMany({ where: { date } }),
    prisma.calorieEntry.findMany({ where: { date } }),
    prisma.sleepEntry.findFirst({ where: { date } }),
    prisma.stimulantEntry.findMany({ where: { date }, orderBy: { time: "asc" } }),
    prisma.settings.findFirst(),
  ]);

  const calorieGoal = settings?.calorieGoal ?? 2000;
  const proteinGoal = settings?.proteinGoal ?? 150;
  const totalCalories = calories.reduce((s, e) => s + e.calories, 0);
  const totalProtein = calories.reduce((s, e) => s + (e.protein ?? 0), 0);

  const breakdown = calcEnergy({
    sleep: sleep ? { duration: sleep.duration, quality: sleep.quality } : null,
    calories: { total: totalCalories, goal: calorieGoal },
    protein: { total: totalProtein, goal: proteinGoal },
    stimulants: stimulants.map(s => ({
      name: s.name,
      caffeineMg: s.caffeineMg,
      durationHours: s.durationHours,
      time: s.time,
    })),
    nowHHMM,
  });

  return NextResponse.json(breakdown);
}
