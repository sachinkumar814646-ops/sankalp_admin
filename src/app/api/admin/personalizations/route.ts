import { NextResponse } from "next/server";
import { mockPersonalizationsList } from "@/mocks/personalizations";
import { mockUsersList } from "@/mocks/users";
import { mockNaamList } from "@/mocks/naam";
import { mockDesigns } from "@/mocks/designs";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function GET(req: Request) {
  await delay(300);
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const approvalStatus = searchParams.get("approvalStatus") || "all";
  const language = searchParams.get("language") || "all";
  const edition = searchParams.get("edition") || "all";
  const bookSize = searchParams.get("bookSize") || "all";

  let list = mockPersonalizationsList.map((p) => {
    const user = mockUsersList.find((u) => u.id === p.userId);
    const naam = mockNaamList.find((n) => n.id === p.naamId);
    const design = mockDesigns.find((d) => d.id === p.designId);
    return {
      ...p,
      user,
      naam,
      design,
    };
  });

  if (approvalStatus !== "all") {
    list = list.filter((p) => p.approvalStatus === approvalStatus);
  }

  if (language !== "all") {
    list = list.filter((p) => p.language === language);
  }

  if (edition !== "all") {
    list = list.filter((p) => p.edition === edition);
  }

  if (bookSize !== "all") {
    list = list.filter((p) => p.bookSize === bookSize);
  }

  if (search) {
    list = list.filter(
      (p) =>
        p.orderNumber.toLowerCase().includes(search) ||
        p.recipientName.toLowerCase().includes(search) ||
        p.fromName.toLowerCase().includes(search) ||
        p.dedication.toLowerCase().includes(search) ||
        p.naam?.name.toLowerCase().includes(search) ||
        p.naam?.name_hindi.includes(search)
    );
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = list.length;
  const start = (page - 1) * limit;
  const data = list.slice(start, start + limit);

  return NextResponse.json({ data, total, page, limit });
}
