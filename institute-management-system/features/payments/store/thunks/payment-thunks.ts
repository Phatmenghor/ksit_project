import { createApiThunk } from "@/utils/axios/api-wrapper";
import { axiosClientWithAuth } from "@/utils/axios";
import { AllPaymentModel, PaymentModel } from "@/model/payment/payment-model";
import { AllPaymentFilterModel } from "@/model/payment/payment-model";
import { PaymentRequest } from "@/model/payment/payment-request-model";

export const fetchAllPaymentsService = createApiThunk<
  AllPaymentModel,
  AllPaymentFilterModel
>("payments/fetchAll", async (params) => {
  const response = await axiosClientWithAuth.post<{ data: AllPaymentModel }>(
    "/v1/payments/all",
    params
  );
  return response.data.data;
});

export const createPaymentByTokenService = createApiThunk<
  PaymentModel,
  PaymentRequest
>("payments/createByToken", async (data) => {
  const response = await axiosClientWithAuth.post<{ data: PaymentModel }>(
    "/v1/payments/token",
    data
  );
  return response.data.data;
});

export const updatePaymentByTokenService = createApiThunk<
  PaymentModel,
  { id: number; data: PaymentRequest }
>("payments/updateByToken", async ({ id, data }) => {
  const response = await axiosClientWithAuth.put<{ data: PaymentModel }>(
    `/v1/payments/token/${id}`,
    data
  );
  return response.data.data;
});

export const deletePaymentService = createApiThunk<PaymentModel, number>(
  "payments/delete",
  async (id) => {
    const response = await axiosClientWithAuth.delete<{ data: PaymentModel }>(
      `/v1/payments/${id}`
    );
    return response.data.data;
  }
);
