CREATE TABLE "StimulantEntry" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "caffeineMg" INTEGER NOT NULL,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StimulantEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomStimulant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "caffeineMg" INTEGER NOT NULL,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomStimulant_pkey" PRIMARY KEY ("id")
);
