import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllStatisticService() {
  try {
    const response = await axiosClientWithAuth.get(`/v1/statistics/overview`);
    console.log("#", response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all subject:", error);
    return null;
  }
}
