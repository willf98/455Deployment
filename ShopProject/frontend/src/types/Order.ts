export interface Order {
  orderId: number;
  orderDatetime: string;
  orderTotal: number;
  isShipped: boolean;
}

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDetail {
  orderId: number;
  orderDatetime: string;
  orderTotal: number;
  paymentMethod: string;
  items: OrderItem[];
}
