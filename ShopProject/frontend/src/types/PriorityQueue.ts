export interface PriorityQueueItem {
  orderId: number;
  orderDatetime: string;
  orderTotal: number;
  customerId: number;
  customerName: string;
  lateDeliveryProbability: number | null;
  predictedLateDelivery: number | null;
  predictionTimestamp: string | null;
}
