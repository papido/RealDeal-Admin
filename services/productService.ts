import { firestore } from "@/config/firebase";
import { ProductType, ResponseType } from "@/src/types";
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
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
      price1: productData.price1 || 0,
      price2: productData.price2 || 0,
      category: productData.category || "",
      desc: productData.desc || "",
      speciality: productData.speciality || "",
      createdAt: new Date(),
    };

    const productRef = productData?.id
      ? doc(firestore, "products", productData.id)
      : doc(collection(firestore, "products"));

    // 🔧 Add id to the data before saving
    productToSave.id = productRef.id;

    await setDoc(productRef, productToSave, { merge: true });

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

export const deleteProduct = async (
  productId: string
): Promise<ResponseType> => {
  try {
    const productRef = doc(firestore, "products", productId);
    await deleteDoc(productRef);
    return { success: true, msg: "Product deleted successfully" };
  } catch (err: any) {
    console.log("error deleting product: ", err);
    return { success: false, msg: err.message };
  }
};
