import { firestore } from "@/config/firebase";
import { ProductType, ResponseType } from "@/src/types";
import { collection, doc, setDoc } from "firebase/firestore";
import uuid from "react-native-uuid";
import { uploadFileToCloudinary } from "./imageService";
export const defaultPizzaImage =
  "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png";

export const createProduct = async (
  productData: Partial<ProductType>
): Promise<ResponseType> => {
  try {
    const uploadedImages: string[] = [];

    // ✅ Upload each image in the array
    for (const image of productData.images || []) {
      const uploadResponse = await uploadFileToCloudinary(
        { uri: image.uri },
        "products"
      );

      if (!uploadResponse.success) {
        return {
          success: false,
          msg: uploadResponse.msg || `Failed to upload image`,
        };
      }
      uploadedImages.push(uploadResponse.data);
    }

    // ✅ Prepare the final product object
    const productToSave: ProductType = {
      ...productData,
      images:
        uploadedImages.length > 0
          ? uploadedImages.map((uri) => ({ id: uuid.v4(), uri }))
          : [{ id: uuid.v4(), uri: defaultPizzaImage }],
      name: productData.name || "",
    };

    const productRef = doc(collection(firestore, "products"));
    await setDoc(productRef, productToSave);

    return { success: true, data: { ...productToSave, id: productRef.id } };
  } catch (error: any) {
    console.log("error creating product: ", error);
    return { success: false, msg: error.message };
  }
};

export const updateProduct = async (
  productId: string,
  updatedData: Partial<ProductType>
): Promise<ResponseType> => {
  try {
    const uploadedImages: string[] = [];

    // ✅ Upload new images (if any)
    for (const image of updatedData.images || []) {
      const uploadResponse = await uploadFileToCloudinary(
        { uri: image.uri },
        "products"
      );

      if (!uploadResponse.success) {
        return {
          success: false,
          msg: uploadResponse.msg || `Failed to upload image`,
        };
      }

      uploadedImages.push(uploadResponse.data);
    }

    // ✅ Build final update object
    const productToUpdate: Partial<ProductType> = {
      ...updatedData,
      ...(uploadedImages.length > 0 && {
        images: uploadedImages.map((uri) => ({ id: uuid.v4(), uri })),
      }),
    };

    const productRef = doc(firestore, "products", productId);
    await setDoc(productRef, productToUpdate, { merge: true });

    return { success: true, data: { ...productToUpdate, id: productId } };
  } catch (error: any) {
    console.log("error updating product: ", error);
    return { success: false, msg: error.message };
  }
};
