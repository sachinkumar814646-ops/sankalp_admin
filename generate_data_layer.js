const fs = require('fs');
const path = require('path');

const files = {
  "src/types/index.ts": `export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  created_at: string;
  is_active?: boolean;
};
export type Naam = { id: string; text: string; language: string; is_active: boolean; };
export type Product = { id: string; name: string; description: string; price: number; stock: number; is_active: boolean; };
export type Order = { id: string; user_id: string; product_id: string; quantity: number; total_amount: number; status: string; shipping_address: string; created_at: string; note?: string; tracking?: { courier: string; trackingNumber: string; trackingUrl: string; }; };
export type Payment = { id: string; order_id: string; user_id: string; amount: number; method: string; status: string; transaction_id: string | null; created_at: string; };
export type Paginated<T> = { data: T[]; total: number; page: number; limit: number; };
`,

  "src/repositories/interfaces.ts": `import { Paginated, User, Naam, Product, Order, Payment } from '../types';
export interface UsersRepo { list(params: any): Promise<Paginated<User>>; get(id: string): Promise<User | null>; setActive(id: string, active: boolean): Promise<User>; }
export interface NaamRepo { list(params: any): Promise<Paginated<Naam>>; get(id: string): Promise<Naam | null>; create(data: any): Promise<Naam>; update(id: string, data: any): Promise<Naam>; remove(id: string): Promise<void>; }
export interface ProductsRepo { list(params: any): Promise<Paginated<Product>>; get(id: string): Promise<Product | null>; create(data: any): Promise<Product>; update(id: string, data: any): Promise<Product>; remove(id: string): Promise<void>; }
export interface OrdersRepo { list(params: any): Promise<Paginated<Order>>; get(id: string): Promise<Order | null>; updateStatus(id: string, status: string, note?: string): Promise<Order>; addTracking(id: string, tracking: any): Promise<Order>; }
export interface PaymentsRepo { list(params: any): Promise<Paginated<Payment>>; get(id: string): Promise<Payment | null>; }
`,

  "src/repositories/mock/index.ts": `import { UsersRepo, NaamRepo, ProductsRepo, OrdersRepo, PaymentsRepo } from '../interfaces';
import usersData from '../../mocks/users.json';
import naamData from '../../mocks/naam.json';
import productsData from '../../mocks/products.json';
import ordersData from '../../mocks/orders.json';
import paymentsData from '../../mocks/payments.json';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function buildRepo(initialData: any[]) {
  let data = [...initialData];
  return {
    async list({ page = 1, limit = 10, search = '', filters = {}, sort = '' }: any) {
      await delay(300);
      let res = [...data];
      if (search) res = res.filter(i => JSON.stringify(i).toLowerCase().includes(search.toLowerCase()));
      for (const [k, v] of Object.entries(filters)) if (v) res = res.filter(i => i[k] === v);
      if (sort) {
        const [key, dir] = sort.split(':');
        res.sort((a, b) => {
          if (a[key] < b[key]) return dir === 'desc' ? 1 : -1;
          if (a[key] > b[key]) return dir === 'desc' ? -1 : 1;
          return 0;
        });
      }
      return { data: res.slice((page - 1) * limit, page * limit), total: res.length, page, limit };
    },
    async get(id: string) { await delay(300); return data.find(i => i.id === id) || null; },
    async create(item: any) { await delay(300); const newItem = { ...item, id: Math.random().toString(36).substring(7) }; data.unshift(newItem); return newItem; },
    async update(id: string, item: any) { await delay(300); const idx = data.findIndex(i => i.id === id); if (idx > -1) { data[idx] = { ...data[idx], ...item }; return data[idx]; } throw new Error('Not found'); },
    async remove(id: string) { await delay(300); data = data.filter(i => i.id !== id); }
  };
}

export const mockUsersRepo: UsersRepo = {
  ...buildRepo(usersData),
  async setActive(id, active) { const u = await this.get(id); if (u) return this.update(id, { is_active: active }); throw new Error('Not found'); }
} as any;
export const mockNaamRepo: NaamRepo = buildRepo(naamData) as any;
export const mockProductsRepo: ProductsRepo = buildRepo(productsData) as any;
export const mockOrdersRepo: OrdersRepo = {
  ...buildRepo(ordersData),
  async updateStatus(id, status, note) { return this.update(id, { status, note }); },
  async addTracking(id, tracking) { return this.update(id, { tracking }); }
} as any;
export const mockPaymentsRepo: PaymentsRepo = buildRepo(paymentsData) as any;
`,

  "src/repositories/laravel/index.ts": `import { UsersRepo, NaamRepo, ProductsRepo, OrdersRepo, PaymentsRepo } from '../interfaces';
const notImpl = () => { throw new Error('Not implemented'); };
export const laravelUsersRepo: UsersRepo = { list: notImpl, get: notImpl, setActive: notImpl } as any;
export const laravelNaamRepo: NaamRepo = { list: notImpl, get: notImpl, create: notImpl, update: notImpl, remove: notImpl } as any;
export const laravelProductsRepo: ProductsRepo = { list: notImpl, get: notImpl, create: notImpl, update: notImpl, remove: notImpl } as any;
export const laravelOrdersRepo: OrdersRepo = { list: notImpl, get: notImpl, updateStatus: notImpl, addTracking: notImpl } as any;
export const laravelPaymentsRepo: PaymentsRepo = { list: notImpl, get: notImpl } as any;
`,

  "src/repositories/index.ts": `import { mockUsersRepo, mockNaamRepo, mockProductsRepo, mockOrdersRepo, mockPaymentsRepo } from './mock';
import { laravelUsersRepo, laravelNaamRepo, laravelProductsRepo, laravelOrdersRepo, laravelPaymentsRepo } from './laravel';
const source = process.env.DATA_SOURCE || 'mock';
export const Users = source === 'laravel' ? laravelUsersRepo : mockUsersRepo;
export const NaamRepo = source === 'laravel' ? laravelNaamRepo : mockNaamRepo;
export const Products = source === 'laravel' ? laravelProductsRepo : mockProductsRepo;
export const Orders = source === 'laravel' ? laravelOrdersRepo : mockOrdersRepo;
export const Payments = source === 'laravel' ? laravelPaymentsRepo : mockPaymentsRepo;
`,

  "src/app/api/admin/users/route.ts": `import { NextResponse } from 'next/server';
import { Users } from '@/repositories';
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const res = await Users.list({ page, limit });
  return NextResponse.json(res);
}
`,
  "src/app/api/admin/users/[id]/route.ts": `import { NextResponse } from 'next/server';
import { Users } from '@/repositories';
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const res = await Users.get(params.id);
  return res ? NextResponse.json(res) : NextResponse.json({error: 'Not found'}, {status: 404});
}
`,
  "src/app/api/admin/users/[id]/active/route.ts": `import { NextResponse } from 'next/server';
import { Users } from '@/repositories';
import { z } from 'zod';
const schema = z.object({ active: z.boolean() });
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const valid = schema.parse(body);
  const res = await Users.setActive(params.id, valid.active);
  return NextResponse.json(res);
}
`,

  "src/app/api/admin/naam/route.ts": `import { NextResponse } from 'next/server';
import { NaamRepo } from '@/repositories';
import { z } from 'zod';
const schema = z.object({ text: z.string(), language: z.string(), is_active: z.boolean() });
export async function GET(req: Request) { return NextResponse.json(await NaamRepo.list({})); }
export async function POST(req: Request) { return NextResponse.json(await NaamRepo.create(schema.parse(await req.json()))); }
`,
  "src/app/api/admin/naam/[id]/route.ts": `import { NextResponse } from 'next/server';
import { NaamRepo } from '@/repositories';
import { z } from 'zod';
const schema = z.object({ text: z.string().optional(), language: z.string().optional(), is_active: z.boolean().optional() });
export async function GET(req: Request, { params }: { params: { id: string } }) { return NextResponse.json(await NaamRepo.get(params.id)); }
export async function PUT(req: Request, { params }: { params: { id: string } }) { return NextResponse.json(await NaamRepo.update(params.id, schema.parse(await req.json()))); }
export async function DELETE(req: Request, { params }: { params: { id: string } }) { await NaamRepo.remove(params.id); return NextResponse.json({ok: true}); }
`,

  "src/app/api/admin/products/route.ts": `import { NextResponse } from 'next/server';
import { Products } from '@/repositories';
import { z } from 'zod';
const schema = z.object({ name: z.string(), description: z.string(), price: z.number(), stock: z.number(), is_active: z.boolean() });
export async function GET(req: Request) { return NextResponse.json(await Products.list({})); }
export async function POST(req: Request) { return NextResponse.json(await Products.create(schema.parse(await req.json()))); }
`,
  "src/app/api/admin/products/[id]/route.ts": `import { NextResponse } from 'next/server';
import { Products } from '@/repositories';
import { z } from 'zod';
const schema = z.object({ name: z.string().optional(), description: z.string().optional(), price: z.number().optional(), stock: z.number().optional(), is_active: z.boolean().optional() });
export async function GET(req: Request, { params }: { params: { id: string } }) { return NextResponse.json(await Products.get(params.id)); }
export async function PUT(req: Request, { params }: { params: { id: string } }) { return NextResponse.json(await Products.update(params.id, schema.parse(await req.json()))); }
export async function DELETE(req: Request, { params }: { params: { id: string } }) { await Products.remove(params.id); return NextResponse.json({ok: true}); }
`,

  "src/app/api/admin/orders/route.ts": `import { NextResponse } from 'next/server';
import { Orders } from '@/repositories';
export async function GET(req: Request) { return NextResponse.json(await Orders.list({})); }
`,
  "src/app/api/admin/orders/[id]/route.ts": `import { NextResponse } from 'next/server';
import { Orders } from '@/repositories';
export async function GET(req: Request, { params }: { params: { id: string } }) { return NextResponse.json(await Orders.get(params.id)); }
`,
  "src/app/api/admin/orders/[id]/status/route.ts": `import { NextResponse } from 'next/server';
import { Orders } from '@/repositories';
import { z } from 'zod';
const schema = z.object({ status: z.string(), note: z.string().optional() });
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const valid = schema.parse(await req.json());
  return NextResponse.json(await Orders.updateStatus(params.id, valid.status, valid.note));
}
`,
  "src/app/api/admin/orders/[id]/tracking/route.ts": `import { NextResponse } from 'next/server';
import { Orders } from '@/repositories';
import { z } from 'zod';
const schema = z.object({ courier: z.string(), trackingNumber: z.string(), trackingUrl: z.string() });
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json(await Orders.addTracking(params.id, schema.parse(await req.json())));
}
`,

  "src/app/api/admin/payments/route.ts": `import { NextResponse } from 'next/server';
import { Payments } from '@/repositories';
export async function GET(req: Request) { return NextResponse.json(await Payments.list({})); }
`,
  "src/app/api/admin/payments/[id]/route.ts": `import { NextResponse } from 'next/server';
import { Payments } from '@/repositories';
export async function GET(req: Request, { params }: { params: { id: string } }) { return NextResponse.json(await Payments.get(params.id)); }
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
}
console.log('Data layer generated');
