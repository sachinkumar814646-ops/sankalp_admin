import { NextResponse } from "next/server";
import { mockUsersList } from "@/mocks/users";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay(300);
  const { id } = await params;
  const numId = parseInt(id, 10);
  const index = mockUsersList.findIndex((u) => u.id === numId);

  if (index === -1) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const newStatus = body.status || (body.active ? "active" : "disabled");

  mockUsersList[index] = {
    ...mockUsersList[index],
    status: newStatus,
  };

  return NextResponse.json(mockUsersList[index]);
}
