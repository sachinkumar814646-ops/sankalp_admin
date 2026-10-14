import { NextResponse } from 'next/server';
import { Orders } from '@/repositories';
export async function GET(req: Request) { return NextResponse.json(await Orders.list({})); }
