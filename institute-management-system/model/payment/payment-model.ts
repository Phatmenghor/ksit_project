export interface AllPaymentFilterModel {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: string;
  userId?: number;
}

export interface AllPaymentModel {
  content: PaymentModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PaymentModel {
  id: number;
  item: string;
  type: string;
  amount: string;
  percentage: string;
  date: string;
  status: string;
  commend: string;
  userId: string;
  createdAt: string;
}


