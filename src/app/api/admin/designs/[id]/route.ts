import { NextResponse } from "next/server";
import { mockDesigns } from "@/mocks/designs";
import { z } from "zod";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const designUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  type: z.enum(["simple", "traditional", "premium"]).optional(),
  description: z.string().min(1, "Description is required").optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay(300);
  const { id } = await params;
  const numId = parseInt(id, 10);
  const item = mockDesigns.find((d) => d.id === numId);

  if (!item) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay(300);
  const { id } = await params;
  const numId = parseInt(id, 10);
  const index = mockDesigns.findIndex((d) => d.id === numId);

  if (index === -1) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = designUpdateSchema.parse(body);

    mockDesigns[index] = {
      ...mockDesigns[index],
      ...parsed,
    };

    return NextResponse.json(mockDesigns[index]);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay(300);
  const { id } = await params;
  const numId = parseInt(id, 10);
  const index = mockDesigns.findIndex((d) => d.id === numId);

  if (index === -1) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }

  mockDesigns.splice(index, 1);
  return NextResponse.json({ ok: true, message: "Design deleted successfully" });
}
