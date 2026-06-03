import { axiosClientWithAuth } from "@/utils/axios";

export async function getAccessibleMenuService() {
  try {
    const response = await axiosClientWithAuth.get(
      "/v1/menus/my-menus/viewable"
    );
    console.log("this response", response);
    return response.data.data;
  } catch (error: any) {
    console.error("Error get menus:", error);
    return null;
  }
}
