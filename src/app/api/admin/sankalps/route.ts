import { NextResponse } from "next/server";
import { mockSankalpsList } from "@/mocks/sankalps";
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
  const status = searchParams.get("status") || "all";
  const naamId = searchParams.get("naamId") || "all";
  const targetCount = searchParams.get("targetCount") || "all";
  const sort = searchParams.get("sort") || "startDate";
  const order = searchParams.get("order") || "desc";

  // Join data
  let list = mockSankalpsList.map((s) => {
    const user = mockUsersList.find((u) => u.id === s.userId);
    const naam = mockNaamList.find((n) => n.id === s.naamId);
    const design = mockDesigns.find((d) => d.id === s.designId);
    return {
      ...s,
      user,
      naam,
      design,
    };
  });

  if (status !== "all") {
    list = list.filter((s) => s.status === status);
  }

  if (naamId !== "all") {
    const nId = parseInt(naamId, 10);
    list = list.filter((s) => s.naamId === nId);
  }

  if (targetCount !== "all") {
    const tCount = parseInt(targetCount, 10);
    list = list.filter((s) => s.targetCount === tCount);
  }

  if (search) {
    list = list.filter((s) => {
      const userName = s.user?.name?.toLowerCase() || "";
      const recipientName = s.recipientName?.toLowerCase() || "";
      const naamName = s.naam?.name?.toLowerCase() || "";
      const naamHindi = s.naam?.name_hindi || "";
      return (
        userName.includes(search) ||
        recipientName.includes(search) ||
        naamName.includes(search) ||
        naamHindi.includes(search)
      );
    });
  }

  // Sorting
  list.sort((a: any, b: any) => {
    let aVal = a[sort];
    let bVal = b[sort];

    if (sort === "progress") {
      aVal = a.completedCount / a.targetCount;
      bVal = b.completedCount / b.targetCount;
    } else if (sort === "streak") {
      aVal = a.currentStreak;
      bVal = b.currentStreak;
    }

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });

  const total = list.length;
  const start = (page - 1) * limit;
  const data = list.slice(start, start + limit);

  return NextResponse.json({ data, total, page, limit });
}
