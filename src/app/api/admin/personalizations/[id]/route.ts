import { NextResponse } from "next/server";
import { mockPersonalizationsList } from "@/mocks/personalizations";
import { mockUsersList } from "@/mocks/users";
import { mockNaamList } from "@/mocks/naam";
import { mockDesigns } from "@/mocks/designs";
import { z } from "zod";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const editSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required").optional(),
  fromName: z.string().min(1, "From name is required").optional(),
  dedication: z.string().min(1, "Dedication is required").optional(),
  dateText: z.string().optional(),
  familyName: z.string().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay(300);
  const { id } = await params;
  const numId = parseInt(id, 10);
  const item = mockPersonalizationsList.find((p) => p.id === numId);

  if (!item) {
    return NextResponse.json({ error: "Personalization record not found" }, { status: 404 });
  }

  const user = mockUsersList.find((u) => u.id === item.userId);
  const naam = mockNaamList.find((n) => n.id === item.naamId);
  const design = mockDesigns.find((d) => d.id === item.designId);

  return NextResponse.json({
    ...item,
    user,
    naam,
    design,
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay(300);
  const { id } = await params;
  const numId = parseInt(id, 10);
  const index = mockPersonalizationsList.findIndex((p) => p.id === numId);

  if (index === -1) {
    return NextResponse.json({ error: "Personalization record not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = editSchema.parse(body);

    mockPersonalizationsList[index] = {
      ...mockPersonalizationsList[index],
      ...parsed,
    };

    return NextResponse.json(mockPersonalizationsList[index]);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
