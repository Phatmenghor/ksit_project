import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllStatisticService() {
  try {
    const response = await axiosClientWithAuth.get(`/v1/statistics/overview`);
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
