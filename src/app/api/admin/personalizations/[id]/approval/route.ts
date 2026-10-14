import { NextResponse } from "next/server";
import { mockPersonalizationsList } from "@/mocks/personalizations";
import { z } from "zod";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const approvalSchema = z.object({
  status: z.enum(["approved", "changes_requested", "pending"]),
  note: z.string().optional(),
}).refine(
  (data) => {
    if (data.status === "changes_requested" && (!data.note || !data.note.trim())) {
      return false;
    }
    return true;
  },
  {
    message: "A note is required when requesting changes",
    path: ["note"],
  }
);

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
    const parsed = approvalSchema.parse(body);

    const isApproved = parsed.status === "approved";
    const orderNumber = mockPersonalizationsList[index].orderNumber;

    mockPersonalizationsList[index] = {
      ...mockPersonalizationsList[index],
      approvalStatus: parsed.status,
      approvalNote: parsed.note?.trim() || undefined,
      finalPdf: isApproved ? `final_book_${orderNumber}_print_ready.pdf` : undefined,
    };

    return NextResponse.json(mockPersonalizationsList[index]);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
