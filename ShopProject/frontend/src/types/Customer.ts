export interface Customer {
  customerId: number;
  fullName: string;
  email: string;
  city?: string;
  state?: string;
  loyaltyTier?: string;
}
