import { UsersRepo, NaamRepo, ProductsRepo, OrdersRepo, PaymentsRepo } from '../interfaces';
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
