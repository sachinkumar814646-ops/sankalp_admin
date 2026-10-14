import { NextResponse } from "next/server";
import { mockSankalpsList } from "@/mocks/sankalps";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function GET() {
  await delay(200);
  const total = mockSankalpsList.length;
  const active = mockSankalpsList.filter((s) => s.status === "active").length;
  const completed = mockSankalpsList.filter((s) => s.status === "completed").length;
  const paused = mockSankalpsList.filter((s) => s.status === "paused").length;

  const totalNaamWritten = mockSankalpsList.reduce((acc, s) => acc + s.completedCount, 0);
  const totalTargets = mockSankalpsList.reduce((acc, s) => acc + s.targetCount, 0);
  const avgCompletionPercent = totalTargets > 0 ? ((totalNaamWritten / totalTargets) * 100).toFixed(1) : "0";

  return NextResponse.json({
    total,
    active,
    completed,
    paused,
    totalNaamWritten,
    avgCompletionPercent: Number(avgCompletionPercent),
  });
}
