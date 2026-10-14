import { NextResponse } from "next/server";
import { mockSankalpsList } from "@/mocks/sankalps";
import { z } from "zod";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const statusUpdateSchema = z.object({
  status: z.enum(["active", "paused"]),
  reason: z.string().min(1, "Reason is required"),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay(300);
  const { id } = await params;
  const numId = parseInt(id, 10);
  const index = mockSankalpsList.findIndex((s) => s.id === numId);

  if (index === -1) {
    return NextResponse.json({ error: "Sankalp not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = statusUpdateSchema.parse(body);

    mockSankalpsList[index] = {
      ...mockSankalpsList[index],
      status: parsed.status,
      pauseReason: parsed.status === "paused" ? parsed.reason : undefined,
    };

    return NextResponse.json(mockSankalpsList[index]);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
