import { UsersRepo, NaamRepo, ProductsRepo, OrdersRepo, PaymentsRepo } from '../interfaces';
const notImpl = () => { throw new Error('Not implemented'); };
export const laravelUsersRepo: UsersRepo = { list: notImpl, get: notImpl, setActive: notImpl } as any;
export const laravelNaamRepo: NaamRepo = { list: notImpl, get: notImpl, create: notImpl, update: notImpl, remove: notImpl } as any;
export const laravelProductsRepo: ProductsRepo = { list: notImpl, get: notImpl, create: notImpl, update: notImpl, remove: notImpl } as any;
export const laravelOrdersRepo: OrdersRepo = { list: notImpl, get: notImpl, updateStatus: notImpl, addTracking: notImpl } as any;
export const laravelPaymentsRepo: PaymentsRepo = { list: notImpl, get: notImpl } as any;
