import { NextResponse } from 'next/server';
import { Orders } from '@/repositories';
import { z } from 'zod';
const schema = z.object({ status: z.string(), note: z.string().optional() });
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const valid = schema.parse(await req.json());
  return NextResponse.json(await Orders.updateStatus(id, valid.status, valid.note));
}
