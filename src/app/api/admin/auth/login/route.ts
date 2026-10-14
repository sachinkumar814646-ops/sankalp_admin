import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);

    const isMock = (process.env.DATA_SOURCE || 'mock') === 'mock';

    if (isMock && email === "admin@naamvriddhi.com" && password === "Admin@123") {
      const session = await getSession();
      session.user = { email, name: "Admin", role: "super_admin" };
      session.isLoggedIn = true;
      await session.save();
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
