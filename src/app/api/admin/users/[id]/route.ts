import { NextResponse } from "next/server";
import { mockUsersList } from "@/mocks/users";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay(300);
  const { id } = await params;
  const numId = parseInt(id, 10);
  const user = mockUsersList.find((u) => u.id === numId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
