import { NextResponse } from 'next/server';
import { Payments } from '@/repositories';
export async function GET(req: Request) { return NextResponse.json(await Payments.list({})); }
