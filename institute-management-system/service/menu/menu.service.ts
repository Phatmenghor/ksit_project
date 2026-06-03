import { axiosClientWithAuth } from "@/utils/axios";

export async function getAccessibleMenuService() {
  try {
    const response = await axiosClientWithAuth.get(
      "/v1/menus/my-menus/viewable"
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
}
