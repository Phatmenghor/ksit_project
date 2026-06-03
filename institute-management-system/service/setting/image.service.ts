import { UploadImage } from "@/model/setting/image-model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function uploadImageService(data: UploadImage) {
  try {
    const response = await axiosClientWithAuth.post(`/images`, data);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}
