import { NextResponse } from "next/server";
import { mockProductList } from "@/mocks/products";
import { mockNaamList } from "@/mocks/naam";
import { z } from "zod";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const TARGET_COUNTS = [1008, 5000, 11000, 21000, 51000, 100000] as const;

const productCreateSchema = z.object({
  naamId: z.coerce.number().int().positive(),
  targetCount: z.coerce.number().refine((v) => TARGET_COUNTS.includes(v as any)),
  bookSize: z.enum(["A5", "A4 Large Print"]),
  binding: z.enum(["Perfect", "Wiro"]),
  edition: z.enum(["Standard", "Premium Gift"]),
  basePrice: z.coerce.number().positive(),
  shippingFee: z.coerce.number().nonnegative(),
  status: z.enum(["active", "inactive"]).default("active"),
});

function calcPages(targetCount: number) {
  return Math.ceil(targetCount / 100) + 5;
}

function buildName(
  naamId: number,
  targetCount: number,
  bookSize: string,
  edition: string
) {
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

export async function GET(req: Request) {
  await delay(300);
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const naamId = searchParams.get("naamId") || "all";
  const targetCount = searchParams.get("targetCount") || "all";
  const bookSize = searchParams.get("bookSize") || "all";
  const edition = searchParams.get("edition") || "all";
  const status = searchParams.get("status") || "all";
  const sort = searchParams.get("sort") || "id";
  const order = searchParams.get("order") || "asc";

  let filtered = [...mockProductList];

  if (status !== "all") filtered = filtered.filter((p) => p.status === status);
  if (naamId !== "all") filtered = filtered.filter((p) => p.naamId === parseInt(naamId, 10));
  if (targetCount !== "all") filtered = filtered.filter((p) => p.targetCount === parseInt(targetCount, 10));
  if (bookSize !== "all") filtered = filtered.filter((p) => p.bookSize === bookSize);
  if (edition !== "all") filtered = filtered.filter((p) => p.edition === edition);
  if (search) filtered = filtered.filter((p) => p.name.toLowerCase().includes(search));

  filtered.sort((a, b) => {
    const av = (a as any)[sort] ?? 0;
    const bv = (b as any)[sort] ?? 0;
    return order === "desc" ? (bv > av ? 1 : -1) : av > bv ? 1 : -1;
  });

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit).map(joinNaam);

  return NextResponse.json({ data, total, page, limit });
}

export async function POST(req: Request) {
  await delay(300);
  try {
    const body = await req.json();
    const parsed = productCreateSchema.parse(body);
    const nextId = mockProductList.length > 0 ? Math.max(...mockProductList.map((p) => p.id)) + 1 : 1;

    const newItem = {
      id: nextId,
      name: buildName(parsed.naamId, parsed.targetCount, parsed.bookSize, parsed.edition),
      naamId: parsed.naamId,
      targetCount: parsed.targetCount as 1008 | 5000 | 11000 | 21000 | 51000 | 100000,
      bookSize: parsed.bookSize,
      binding: parsed.binding,
      edition: parsed.edition,
      pages: calcPages(parsed.targetCount),
      basePrice: parsed.basePrice,
      shippingFee: parsed.shippingFee,
      status: parsed.status,
      createdAt: new Date().toISOString(),
    };

    mockProductList.push(newItem);
    return NextResponse.json(joinNaam(newItem), { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
