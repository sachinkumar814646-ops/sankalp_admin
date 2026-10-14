import { NextResponse } from "next/server";
import { mockSankalpsList, generateSankalpCalendar } from "@/mocks/sankalps";
import { mockUsersList } from "@/mocks/users";
import { mockNaamList } from "@/mocks/naam";
import { mockDesigns } from "@/mocks/designs";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay(300);
  const { id } = await params;
  const numId = parseInt(id, 10);
  const sankalp = mockSankalpsList.find((s) => s.id === numId);

  if (!sankalp) {
    return NextResponse.json({ error: "Sankalp not found" }, { status: 404 });
  }

  const user = mockUsersList.find((u) => u.id === sankalp.userId);
  const naam = mockNaamList.find((n) => n.id === sankalp.naamId);
  const design = mockDesigns.find((d) => d.id === sankalp.designId);
  const calendar = generateSankalpCalendar(sankalp.id);

  return NextResponse.json({
    ...sankalp,
    user,
    naam,
    design,
    calendar,
  });
}
