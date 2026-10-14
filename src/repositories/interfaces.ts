import { Paginated, User, Naam, Product, Order, Payment } from '../types';
export interface UsersRepo { list(params: any): Promise<Paginated<User>>; get(id: string): Promise<User | null>; setActive(id: string, active: boolean): Promise<User>; }
export interface NaamRepo { list(params: any): Promise<Paginated<Naam>>; get(id: string): Promise<Naam | null>; create(data: any): Promise<Naam>; update(id: string, data: any): Promise<Naam>; remove(id: string): Promise<void>; }
export interface ProductsRepo { list(params: any): Promise<Paginated<Product>>; get(id: string): Promise<Product | null>; create(data: any): Promise<Product>; update(id: string, data: any): Promise<Product>; remove(id: string): Promise<void>; }
export interface OrdersRepo { list(params: any): Promise<Paginated<Order>>; get(id: string): Promise<Order | null>; updateStatus(id: string, status: string, note?: string): Promise<Order>; addTracking(id: string, tracking: any): Promise<Order>; }
export interface PaymentsRepo { list(params: any): Promise<Paginated<Payment>>; get(id: string): Promise<Payment | null>; }
