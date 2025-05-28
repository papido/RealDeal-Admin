import { firestore } from "@/config/firebase";
import { ProductType } from "@/src/types";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";

export const useFetchId = () => {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProduct = async (id: string) => {
    setLoading(true);
    const productDoc = await getDoc(doc(firestore, "products", id));
    if (productDoc.exists()) {
      setProduct({ id: productDoc.id, ...productDoc.data() } as ProductType);
    } else {
      setProduct(null);
    }
    setLoading(false);
  };

  return { product, loading, fetchProduct };
};
