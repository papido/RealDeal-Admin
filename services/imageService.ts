import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "@/src/constants";
import { ResponseType } from "@/src/types";
import axios from "axios";

const CLOUDINARY_API_URL = `curl https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload -X POST --data 'file=<FILE>&timestamp=<TIMESTAMP>&api_key=<API_KEY>&signature=<SIGNATURE>'`;

export const uploadFileToCloudinary = async (
  file: { uri?: string } | string,
  folderName: string
): Promise<ResponseType> => {
  try {
    if (!file) return { success: true, data: null };
    if (typeof file == "string") {
      return { success: true, data: file };
    }

    if (file && file.uri) {
      const formData = new FormData();
      formData.append("file", {
        uri: file?.uri,
        type: "image/jpeg",
        name: file?.uri?.split("/").pop() || "file.jpg",
      } as any);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", folderName);

      const response = await axios.post(CLOUDINARY_API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return { success: true, data: response?.data?.secure_url };
    }

    return { success: true };
  } catch (error: any) {
    console.log("got error uploading file: ", error);
    return { success: false, msg: error.message || "Could not upload file" };
  }
};

export const getFilePath = (file: any) => {
  if (file && typeof file == "string") return file;
  if (file && typeof file == "object" && file.uri) return file.uri;

  return null;
};
