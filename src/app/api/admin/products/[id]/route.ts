import { NextResponse } from "next/server";
import { mockProductList } from "@/mocks/products";
import { mockNaamList } from "@/mocks/naam";
import { z } from "zod";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const TARGET_COUNTS = [1008, 5000, 11000, 21000, 51000, 100000] as const;

const productUpdateSchema = z.object({
  naamId: z.coerce.number().int().positive().optional(),
  targetCount: z.coerce.number().refine((v) => TARGET_COUNTS.includes(v as any)).optional(),
  bookSize: z.enum(["A5", "A4 Large Print"]).optional(),
  binding: z.enum(["Perfect", "Wiro"]).optional(),
  edition: z.enum(["Standard", "Premium Gift"]).optional(),
  basePrice: z.coerce.number().positive().optional(),
  shippingFee: z.coerce.number().nonnegative().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

function calcPages(targetCount: number) {
  return Math.ceil(targetCount / 100) + 5;
}

function buildName(naamId: number, targetCount: number, bookSize: string, edition: string) {
  const naam = mockNaamList.find((n) => n.id === naamId);
  const naamName = naam?.name ?? "Naam";
  const tc = targetCount.toLocaleString("en-IN");
  const size = bookSize === "A4 Large Print" ? " (A4)" : "";
  const ed = edition === "Premium Gift" ? " – Premium Gift" : "";
  return `${tc} ${naamName} Naam Pustika${size}${ed}`;
}

function joinNaam(p: typeof mockProductList[number]) {
  const naam = mockNaamList.find((n) => n.id === p.naamId);
  return { ...p, naam: naam ? { id: naam.id, name: naam.name, icon: naam.icon } : undefined };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay(300);
  const { id } = await params;
  const item = mockProductList.find((p) => p.id === parseInt(id, 10));
  if (!item) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(joinNaam(item));
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay(300);
  const { id } = await params;
  const index = mockProductList.findIndex((p) => p.id === parseInt(id, 10));
  if (index === -1) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  try {
    const body = await req.json();
    const parsed = productUpdateSchema.parse(body);

    const existing = mockProductList[index];
    const merged = { ...existing, ...parsed } as typeof existing;

    // Recalculate derived fields when relevant fields change
    if (parsed.naamId || parsed.targetCount || parsed.bookSize || parsed.edition) {
      merged.name = buildName(merged.naamId, merged.targetCount, merged.bookSize, merged.edition);
    }
    if (parsed.targetCount) {
      merged.pages = calcPages(merged.targetCount);
    }

    mockProductList[index] = merged;
    return NextResponse.json(joinNaam(mockProductList[index]));
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
  const index = mockProductList.findIndex((p) => p.id === parseInt(id, 10));
  if (index === -1) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  mockProductList.splice(index, 1);
  return NextResponse.json({ ok: true, message: "Product deleted" });
}
