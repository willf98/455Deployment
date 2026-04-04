export interface PriorityQueueItem {
  orderId: number;
  orderDatetime: string;
  orderTotal: number;
  customerId: number;
  customerName: string;
  fraudProbability: number | null;
  predictedFraud: number | null;
  predictionTimestamp: string | null;
}
