CREATE TABLE "CalorieEntry" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "meal" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CalorieEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WaterEntry" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaterEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VitaminEntry" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taken" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VitaminEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SleepEntry" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "bedtime" TEXT NOT NULL,
    "wakeTime" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "quality" INTEGER NOT NULL,
    "fromWatch" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SleepEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EnergyEntry" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EnergyEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "calorieGoal" INTEGER NOT NULL DEFAULT 2000,
    "waterGoal" INTEGER NOT NULL DEFAULT 2500,
    "vitamins" TEXT NOT NULL DEFAULT '[]',
    "apiKey" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
