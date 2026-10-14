import { Sankalp, SankalpCalendarDay } from "@/types";
import { mockUsersList } from "./users";
import { mockNaamList } from "./naam";
import { mockDesigns } from "./designs";

const targetOptions: (1008 | 5000 | 11000 | 21000 | 51000 | 100000)[] = [
  1008, 5000, 11000, 21000, 51000, 100000,
];

const recipientTypes: ("Myself" | "Mother" | "Father" | "Family" | "Someone Special")[] = [
  "Myself", "Mother", "Father", "Family", "Someone Special",
];

const intentions = [
  "For peace, prosperity, and spiritual growth of my family.",
  "For health, long life, and divine blessings for my parents.",
  "In heartfelt gratitude to Bhagavan for endless grace and guidance.",
  "Seeking peace of mind, focus, and devotion in daily life.",
  "For overcoming hurdles and success in spiritual pursuit.",
  "For the auspicious welfare of all living beings and inner joy.",
];

// Seeded pseudorandom generator (seed = 7)
let seed = 7;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateSankalpCalendar(sankalpId: number): SankalpCalendarDay[] {
  // Deterministic calendar generation for the last 60 days
  let localSeed = sankalpId * 31 + 7;
  const days: SankalpCalendarDay[] = [];
  const now = new Date();

  for (let i = 59; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    
    // pseudo random count per day
    const r = (Math.sin(localSeed++) * 10000) - Math.floor(Math.sin(localSeed) * 10000);
    let count = 0;
    if (r > 0.25) {
      count = Math.floor(50 + r * 200); // 50 - 250
    }
    const dailyTarget = 108;
    days.push({
      date: dateStr,
      count,
      dailyTarget,
      completed: count >= dailyTarget,
    });
  }
  return days;
}

export let mockSankalpsList: Sankalp[] = Array.from({ length: 120 }).map((_, index) => {
  const id = index + 1;
  const user = mockUsersList[Math.floor(random() * mockUsersList.length)] || { id: (index % 60) + 1, name: "Devotee" };
  const naam = mockNaamList[Math.floor(random() * mockNaamList.length)] || { id: (index % 10) + 1, name: "Ram" };
  const design = mockDesigns[Math.floor(random() * mockDesigns.length)] || { id: 1, name: "Golden Peetambar" };

  const recipientType = recipientTypes[Math.floor(random() * recipientTypes.length)];
  const recipientName = recipientType === "Myself" ? user.name : `${user.name}'s ${recipientType}`;
  const intention = intentions[Math.floor(random() * intentions.length)];
  const targetCount = targetOptions[Math.floor(random() * targetOptions.length)];

  // Status distribution: ~60% active, ~25% completed, ~15% paused
  const statusRoll = random();
  let status: "active" | "completed" | "paused" = "active";
  if (statusRoll < 0.25) status = "completed";
  else if (statusRoll < 0.40) status = "paused";

  let completedCount = 0;
  let completionDate: string | undefined = undefined;
  const daysAgo = Math.floor(random() * 90) + 5;
  const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  if (status === "completed") {
    completedCount = targetCount;
    const completedDaysAgo = Math.max(1, Math.floor(daysAgo * random()));
    completionDate = new Date(Date.now() - completedDaysAgo * 24 * 60 * 60 * 1000).toISOString();
  } else {
    // 0 to targetCount - 1
    completedCount = Math.floor(random() * (targetCount - 100));
    if (completedCount < 0) completedCount = Math.floor(random() * targetCount);
  }

  const currentStreak = status === "paused" ? 0 : Math.floor(random() * 40);
  const longestStreak = Math.max(currentStreak, Math.floor(currentStreak + random() * 20));
  const dailyAverage = Math.floor(50 + random() * 250); // 50 to 300
  const lastWrittenAt = new Date(Date.now() - Math.floor(random() * 3) * 24 * 60 * 60 * 1000).toISOString();

  return {
    id,
    userId: user.id,
    naamId: naam.id,
    designId: design.id,
    recipientType,
    recipientName,
    intention,
    targetCount,
    completedCount,
    status,
    startDate,
    completionDate,
    currentStreak,
    longestStreak,
    dailyAverage,
    lastWrittenAt,
    pauseReason: status === "paused" ? "Temporarily paused on user request during travel." : undefined,
  };
});
