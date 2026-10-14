import { NextResponse } from 'next/server';
import { Orders } from '@/repositories';
import { z } from 'zod';
const schema = z.object({ courier: z.string(), trackingNumber: z.string(), trackingUrl: z.string() });
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(await Orders.addTracking(id, schema.parse(await req.json())));
}
