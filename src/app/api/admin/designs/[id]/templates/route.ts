import { NextResponse } from "next/server";
import { mockDesigns } from "@/mocks/designs";
import { z } from "zod";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const templateUploadSchema = z.object({
  slot: z.enum(["cover", "writingPage", "milestonePage", "completionPage"]),
  fileName: z.string().min(1, "File name is required"),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay(300);
  const { id } = await params;
  const numId = parseInt(id, 10);
  const index = mockDesigns.findIndex((d) => d.id === numId);

  if (index === -1) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = templateUploadSchema.parse(body);

    mockDesigns[index].templates[parsed.slot] = parsed.fileName;

    return NextResponse.json({
      success: true,
      slot: parsed.slot,
      fileName: parsed.fileName,
      templates: mockDesigns[index].templates,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
  }
}
