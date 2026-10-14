import { NextResponse } from 'next/server';
import { Payments } from '@/repositories';
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(await Payments.get(id));
}
