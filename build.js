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

export type Naam = {
  id: string;
  text: string;
  language: string;
  is_active: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_active: boolean;
};

export type Order = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
  note?: string;
  tracking?: {
    courier: string;
    trackingNumber: string;
    trackingUrl: string;
  };
};

export type Payment = {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  method: string;
  status: string;
  transaction_id: string | null;
  created_at: string;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};
`,
    "src/repositories/interfaces.ts": `import { Paginated, User, Naam, Product, Order, Payment } from '../types';

export interface BaseRepo<T> {
  list(params: { page: number; limit: number; search?: string; filters?: Record<string, any>; sort?: string }): Promise<Paginated<T>>;
  getById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface UserRepo extends BaseRepo<User> {
  setActive(id: string, active: boolean): Promise<User>;
}

export interface NaamRepo extends BaseRepo<Naam> {}
export interface ProductRepo extends BaseRepo<Product> {}
export interface OrderRepo extends BaseRepo<Order> {
  updateStatus(id: string, status: string, note?: string): Promise<Order>;
  addTracking(id: string, tracking: { courier: string; trackingNumber: string; trackingUrl: string }): Promise<Order>;
}
export interface PaymentRepo extends BaseRepo<Payment> {}
`,
    "src/repositories/mock/index.ts": `import { UserRepo, NaamRepo, ProductRepo, OrderRepo, PaymentRepo } from '../interfaces';
import usersData from '../../mocks/users.json';
import naamData from '../../mocks/naam.json';
import productsData from '../../mocks/products.json';
import ordersData from '../../mocks/orders.json';
import paymentsData from '../../mocks/payments.json';
import { User, Naam, Product, Order, Payment } from '../../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function createMockRepo<T extends { id: string }>(data: T[]): any {
  let items = [...data];
  return {
    async list({ page, limit, search, filters, sort }: any) {
      await delay(300);
      let filtered = [...items];
      if (search) {
        filtered = filtered.filter((i: any) => JSON.stringify(i).toLowerCase().includes(search.toLowerCase()));
      }
      if (filters) {
        for (const [k, v] of Object.entries(filters)) {
          if (v !== undefined && v !== '') {
            filtered = filtered.filter((i: any) => i[k] === v);
          }
        }
      }
      const total = filtered.length;
      const start = (page - 1) * limit;
      return { data: filtered.slice(start, start + limit), total, page, limit };
    },
    async getById(id: string) {
      await delay(300);
      return items.find(i => i.id === id) || null;
    },
    async create(itemData: any) {
      await delay(300);
      const newItem = { ...itemData, id: Math.random().toString(36).substr(2, 9) };
      items.unshift(newItem);
      return newItem;
    },
    async update(id: string, itemData: any) {
      await delay(300);
      const idx = items.findIndex(i => i.id === id);
      if (idx > -1) {
        items[idx] = { ...items[idx], ...itemData };
        return items[idx];
      }
      throw new Error('Not found');
    },
    async delete(id: string) {
      await delay(300);
      items = items.filter(i => i.id !== id);
    }
  };
}

export const mockUserRepo: UserRepo = {
  ...createMockRepo(usersData),
  async setActive(id: string, active: boolean) {
    const item = await this.getById(id);
    if(item) return this.update(id, { is_active: active });
    throw new Error('Not found');
  }
};

export const mockNaamRepo: NaamRepo = createMockRepo(naamData);
export const mockProductRepo: ProductRepo = createMockRepo(productsData);
export const mockOrderRepo: OrderRepo = {
  ...createMockRepo(ordersData),
  async updateStatus(id: string, status: string, note?: string) {
    return this.update(id, { status, note });
  },
  async addTracking(id: string, tracking: any) {
    return this.update(id, { tracking });
  }
};
export const mockPaymentRepo: PaymentRepo = createMockRepo(paymentsData);
`,
    "src/repositories/laravel/index.ts": `import { UserRepo, NaamRepo, ProductRepo, OrderRepo, PaymentRepo } from '../interfaces';

function notImpl(): any {
  throw new Error("Not implemented");
}

export const laravelUserRepo: UserRepo = {
  list: notImpl, getById: notImpl, create: notImpl, update: notImpl, delete: notImpl, setActive: notImpl
};
export const laravelNaamRepo: NaamRepo = {
  list: notImpl, getById: notImpl, create: notImpl, update: notImpl, delete: notImpl
};
export const laravelProductRepo: ProductRepo = {
  list: notImpl, getById: notImpl, create: notImpl, update: notImpl, delete: notImpl
};
export const laravelOrderRepo: OrderRepo = {
  list: notImpl, getById: notImpl, create: notImpl, update: notImpl, delete: notImpl, updateStatus: notImpl, addTracking: notImpl
};
export const laravelPaymentRepo: PaymentRepo = {
  list: notImpl, getById: notImpl, create: notImpl, update: notImpl, delete: notImpl
};
`,
    "src/repositories/index.ts": `import { mockUserRepo, mockNaamRepo, mockProductRepo, mockOrderRepo, mockPaymentRepo } from './mock';
import { laravelUserRepo, laravelNaamRepo, laravelProductRepo, laravelOrderRepo, laravelPaymentRepo } from './laravel';

const source = process.env.DATA_SOURCE || 'mock';

export const users = source === 'laravel' ? laravelUserRepo : mockUserRepo;
export const naam = source === 'laravel' ? laravelNaamRepo : mockNaamRepo;
export const products = source === 'laravel' ? laravelProductRepo : mockProductRepo;
export const orders = source === 'laravel' ? laravelOrderRepo : mockOrderRepo;
export const payments = source === 'laravel' ? laravelPaymentRepo : mockPaymentRepo;
`,
    "src/lib/session.ts": `import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: string;
  isLoggedIn: boolean;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
  },
};

export async function getSession() {
  const c = await cookies();
  return getIronSession<SessionData>(c, sessionOptions);
}
`,
    "src/middleware.ts": `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'admin_session',
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<{isLoggedIn?: boolean}>(req.cookies, sessionOptions);

  const isApi = req.nextUrl.pathname.startsWith('/api/admin');
  const isAuth = req.nextUrl.pathname.startsWith('/api/admin/auth/login');
  
  if (!session.isLoggedIn && !isAuth) {
    if (isApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  if (session.isLoggedIn && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/login'],
};
`,
    "src/app/api/admin/auth/login/route.ts": `import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (email === 'admin@naamvriddhi.com' && password === 'Admin@123') {
    const session = await getSession();
    session.isLoggedIn = true;
    session.userId = 'admin1';
    await session.save();
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
}

console.log("Files generated.");
