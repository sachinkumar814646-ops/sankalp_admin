import { NextResponse } from "next/server";
import { mockDesigns } from "@/mocks/designs";
import { z } from "zod";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const designCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["simple", "traditional", "premium"]),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export async function GET(req: Request) {
  await delay(300);
  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const status = searchParams.get("status") || "all";

  let list = [...mockDesigns];

  if (status !== "all") {
    list = list.filter((d) => d.status === status);
  }

  if (search) {
    list = list.filter(
      (d) =>
        d.name.toLowerCase().includes(search) ||
        d.type.toLowerCase().includes(search) ||
        d.description.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ data: list, total: list.length });
}

export async function POST(req: Request) {
  await delay(300);
  try {
    const body = await req.json();
    const parsed = designCreateSchema.parse(body);

    const nextId = mockDesigns.length > 0 ? Math.max(...mockDesigns.map((d) => d.id)) + 1 : 1;
    const newItem = {
      id: nextId,
      name: parsed.name,
      type: parsed.type,
      description: parsed.description,
      status: parsed.status,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      templates: {
        cover: null,
        writingPage: null,
        milestonePage: null,
        completionPage: null,
      },
    };

    mockDesigns.push(newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
