import { NextResponse } from "next/server";
import { mockNaamList } from "@/mocks/naam";
import { z } from "zod";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const naamUpdateSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  name_hindi: z.string().min(1, "Hindi name cannot be empty").optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1, "Category cannot be empty").optional(),
  icon: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sort_order: z.coerce.number().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay(300);
  const { id } = await params;
  const numId = parseInt(id, 10);
  const item = mockNaamList.find((n) => n.id === numId);

  if (!item) {
    return NextResponse.json({ error: "Naam not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay(300);
  const { id } = await params;
  const numId = parseInt(id, 10);
  const index = mockNaamList.findIndex((n) => n.id === numId);

  if (index === -1) {
    return NextResponse.json({ error: "Naam not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = naamUpdateSchema.parse(body);

    if (parsed.slug) {
      const slugExists = mockNaamList.some((n) => n.slug === parsed.slug && n.id !== numId);
      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }
    }

    mockNaamList[index] = {
      ...mockNaamList[index],
      ...parsed,
    };

    return NextResponse.json(mockNaamList[index]);
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
  const index = mockNaamList.findIndex((n) => n.id === numId);

  if (index === -1) {
    return NextResponse.json({ error: "Naam not found" }, { status: 404 });
  }

  mockNaamList.splice(index, 1);
  return NextResponse.json({ ok: true, message: "Naam deleted successfully" });
}
