import { AllPaymentModel, PaymentModel } from "@/model/payment/payment-model";

export interface PaymentFilters {
  search: string;
  userId: number | undefined;
  pageNo: number;
}

export interface PaymentOperations {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface PaymentManagementState {
  data: AllPaymentModel | null;
  rollbackSnapshot: AllPaymentModel | null;
  isLoading: boolean;
  error: string | null;
  filters: PaymentFilters;
  operations: PaymentOperations;
}
