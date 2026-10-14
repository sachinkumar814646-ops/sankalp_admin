import { NextResponse } from "next/server";
import { mockUsersList } from "@/mocks/users";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function GET(req: Request) {
  await delay(300);
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const status = searchParams.get("status") || "all";
  const language = searchParams.get("language") || "all";
  const sort = searchParams.get("sort") || "joinedAt";
  const order = searchParams.get("order") || "desc";

  let filtered = [...mockUsersList];

  if (status !== "all") {
    filtered = filtered.filter((u) => u.status === status);
  }

  if (language !== "all") {
    filtered = filtered.filter((u) => u.language === language);
  }

  if (search) {
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.phone.includes(search) ||
        u.city.toLowerCase().includes(search)
    );
  }

  filtered.sort((a: any, b: any) => {
    let aVal = a[sort];
    let bVal = b[sort];
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return NextResponse.json({ data, total, page, limit });
}
