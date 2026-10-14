import { mockUsersRepo, mockNaamRepo, mockProductsRepo, mockOrdersRepo, mockPaymentsRepo } from './mock';
import { laravelUsersRepo, laravelNaamRepo, laravelProductsRepo, laravelOrdersRepo, laravelPaymentsRepo } from './laravel';
const source = process.env.DATA_SOURCE || 'mock';
export const Users = source === 'laravel' ? laravelUsersRepo : mockUsersRepo;
export const NaamRepo = source === 'laravel' ? laravelNaamRepo : mockNaamRepo;
export const Products = source === 'laravel' ? laravelProductsRepo : mockProductsRepo;
export const Orders = source === 'laravel' ? laravelOrdersRepo : mockOrdersRepo;
export const Payments = source === 'laravel' ? laravelPaymentsRepo : mockPaymentsRepo;
