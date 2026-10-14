import { NextResponse } from "next/server";
import { mockNaamList } from "@/mocks/naam";
import { z } from "zod";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const naamCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  name_hindi: z.string().min(1, "Hindi name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  icon: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  sort_order: z.coerce.number().default(0),
});

export async function GET(req: Request) {
  await delay(300);
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const status = searchParams.get("status") || "all";

  let filtered = [...mockNaamList];

  if (status !== "all") {
    filtered = filtered.filter((item) => item.status === status);
  }

  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.name_hindi.includes(search) ||
        item.category.toLowerCase().includes(search)
    );
  }

  filtered.sort((a, b) => a.sort_order - b.sort_order);

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return NextResponse.json({ data, total, page, limit });
}

export async function POST(req: Request) {
  await delay(300);
  try {
    const body = await req.json();
    const parsed = naamCreateSchema.parse(body);

    let slug = parsed.slug?.trim();
    if (!slug) {
      slug = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }

    // Check slug uniqueness
    const exists = mockNaamList.some((n) => n.slug === slug);
    if (exists) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const nextId = mockNaamList.length > 0 ? Math.max(...mockNaamList.map((n) => n.id)) + 1 : 1;
    const newItem = {
      id: nextId,
      name: parsed.name,
      name_hindi: parsed.name_hindi,
      slug,
      description: parsed.description || "",
      category: parsed.category,
      icon: parsed.icon || "🙏",
      status: parsed.status,
      sort_order: parsed.sort_order || nextId,
      createdAt: new Date().toISOString(),
    };

    mockNaamList.push(newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
