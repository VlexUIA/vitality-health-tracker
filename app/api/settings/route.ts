import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({
      data: { calorieGoal: 2000, waterGoal: 2500, proteinGoal: 150, vitamins: '["Vitamin D","Vitamin C","Omega-3","Magnesium"]', apiKey: "" },
    });
  }
  return NextResponse.json({ ...settings, vitamins: JSON.parse(settings.vitamins) });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  let settings = await prisma.settings.findFirst();

  const data = {
    calorieGoal: body.calorieGoal ? Number(body.calorieGoal) : undefined,
    waterGoal: body.waterGoal ? Number(body.waterGoal) : undefined,
    proteinGoal: body.proteinGoal ? Number(body.proteinGoal) : undefined,
    vitamins: body.vitamins ? JSON.stringify(body.vitamins) : undefined,
    apiKey: body.apiKey !== undefined ? body.apiKey : undefined,
  };

  if (settings) {
    settings = await prisma.settings.update({ where: { id: settings.id }, data });
  } else {
    settings = await prisma.settings.create({
      data: {
        calorieGoal: data.calorieGoal ?? 2000,
        waterGoal: data.waterGoal ?? 2500,
        proteinGoal: data.proteinGoal ?? 150,
        vitamins: data.vitamins ?? "[]",
        apiKey: data.apiKey ?? "",
      },
    });
  }

  return NextResponse.json({ ...settings, vitamins: JSON.parse(settings.vitamins) });
}
