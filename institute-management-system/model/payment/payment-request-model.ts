export interface PaymentRequest {
  item: string;
  type: string;
  amount?: string;
  percentage?: string;
  date: string;
  status?: string;
  commend?: string;
  userId?: number;
}
