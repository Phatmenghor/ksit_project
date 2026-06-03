import { AllPaymentFilterModel } from "@/model/payment/payment-model";
import { PaymentRequest } from "@/model/payment/payment-request-model";
import { axiosClientWithAuth } from "@/utils/axios";
const filterDto = {
  pageNo: 1,
  pageSize: 10,
  search: "",
  type: "FREE",
  status: "ACTIVE",
  userId: 10,
};
export async function getAllPaymentService(data: AllPaymentFilterModel) {
  try {
    const response = await axiosClientWithAuth.post("/v1/payments/all", data);
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
export async function createPaymentService(data: PaymentRequest) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/payments`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

export async function updatePaymentService(
  paymentId: number,
  data: PaymentRequest
) {
  try {
    const response = await axiosClientWithAuth.put(
      `/v1/payments/${paymentId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
}
export async function deletedPaymentService(paymentId: number) {
  try {
    const response = await axiosClientWithAuth.delete(
      `/v1/payments/${paymentId}`
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function getPaymentByIdService(paymentId: number) {
  try {
    const response = await axiosClientWithAuth.get(`/v1/payments/${paymentId}`);
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}

export async function createMyPaymentByTokenService(data: PaymentRequest) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/payments/token`, data);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
}

export async function updateMyPaymentByTokenIdService(
  paymentId: number,
  data: PaymentRequest
) {
  try {
    const response = await axiosClientWithAuth.put(
      `/v1/payments/token/${paymentId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
}
