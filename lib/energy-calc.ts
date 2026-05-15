export interface StimulantInput {
  name: string;
  caffeineMg: number;
  durationHours: number;
  time: string; // "HH:MM"
}

export interface EnergyBreakdown {
  total: number;           // 0-10, final score
  base: number;            // 0-8, before stimulants
  sleepScore: number;      // 0-5
  nutritionScore: number;  // 0-3
  stimulantBoost: number;  // 0-2
  sleepDetail: {
    durationScore: number;
    qualityScore: number;
    hasData: boolean;
  };
  nutritionDetail: {
    calorieRatio: number;
    proteinRatio: number;
  };
  stimulantDetail: Array<{
    name: string;
    boost: number;       // current active boost from this stimulant
    timeAgoHours: number;
    isActive: boolean;
  }>;
}

export function calcEnergy(data: {
  sleep: { duration: number; quality: number } | null;
  calories: { total: number; goal: number };
  protein: { total: number; goal: number };
  stimulants: StimulantInput[];
  nowHHMM: string; // current local time "HH:MM"
}): EnergyBreakdown {
  const { sleep, calories, protein, stimulants, nowHHMM } = data;

  // --- Sleep contribution (0–5) ---
  let sleepScore = 2.5; // neutral default when no data logged yet
  let sleepDetail = { durationScore: 0.5, qualityScore: 0.5, hasData: false };

  if (sleep) {
    const durationScore = Math.min(sleep.duration / 8, 1);
    const qualityScore = sleep.quality / 5;
    sleepScore = (durationScore * 0.6 + qualityScore * 0.4) * 5;
    sleepDetail = { durationScore, qualityScore, hasData: true };
  }

  // --- Nutrition contribution (0–3) ---
  const calorieRatio = calories.goal > 0 ? Math.min(calories.total / calories.goal, 1) : 0;
  const proteinRatio = protein.goal > 0 ? Math.min(protein.total / protein.goal, 1) : 0;
  const nutritionScore = (calorieRatio * 0.6 + proteinRatio * 0.4) * 3;

  const base = sleepScore + nutritionScore;

  // --- Stimulant boost (0–2) ---
  const nowMins = toMins(nowHHMM);
  let stimulantBoost = 0;
  const stimulantDetail: EnergyBreakdown["stimulantDetail"] = [];

  for (const s of stimulants) {
    const consumedMins = toMins(s.time);
    // Handle midnight crossover
    const elapsedMins = nowMins >= consumedMins
      ? nowMins - consumedMins
      : nowMins + 1440 - consumedMins;
    const timeAgoHours = elapsedMins / 60;

    const cutoff = s.durationHours * 1.5;
    if (timeAgoHours > cutoff) {
      stimulantDetail.push({ name: s.name, boost: 0, timeAgoHours, isActive: false });
      continue;
    }

    // Exponential decay: half-life ≈ duration / 1.44 (ln2)
    const halfLife = s.durationHours / 1.44;
    const decay = Math.exp(-timeAgoHours / halfLife);

    // 200 mg caffeine = 1 full unit; max 2 units of boost possible
    const unitBoost = (s.caffeineMg / 200) * 2 * decay;
    stimulantBoost += unitBoost;

    stimulantDetail.push({
      name: s.name,
      boost: Math.round(unitBoost * 100) / 100,
      timeAgoHours: Math.round(timeAgoHours * 10) / 10,
      isActive: true,
    });
  }

  stimulantBoost = Math.min(stimulantBoost, 2);
  const total = Math.min(Math.max(base + stimulantBoost, 0), 10);

  return {
    total: Math.round(total * 10) / 10,
    base: Math.round(base * 10) / 10,
    sleepScore: Math.round(sleepScore * 10) / 10,
    nutritionScore: Math.round(nutritionScore * 10) / 10,
    stimulantBoost: Math.round(stimulantBoost * 100) / 100,
    sleepDetail,
    nutritionDetail: { calorieRatio, proteinRatio },
    stimulantDetail,
  };
}

function toMins(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
