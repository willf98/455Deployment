import type { Customer } from './Customer';

export interface RecentOrder {
  orderId: number;
  orderDatetime: string;
  orderTotal: number;
  isShipped: boolean;
}

export interface DashboardData {
  customer: Customer;
  totalOrders: number;
  totalSpend: number;
  recentOrders: RecentOrder[];
}
