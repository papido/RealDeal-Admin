import { createOrder } from "@/services/orderService";
import dayjs from "dayjs";
import { randomUUID } from "expo-crypto";
import { router } from "expo-router";
import {
  addDoc,
  collection,
  getFirestore,
  Timestamp,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { Alert } from "react-native";
import {
  CartItem,
  OrderType,
  PaymentType,
  ProductItem,
  ProductType,
} from "../types";
import { useAuth } from "./authProvider";

type CartType = {
  items: CartItem[];
  order: OrderType;
  addItem: (product: ProductType, item: CartItem["productItem"]) => void;
  updateQuantity: (itemId: string, amount: -1 | 1) => void;
  total: number;
  checkout: (deliveryDate: Date) => void;
  loading: boolean;
  submitPayment: (image: string) => void;
  payment: PaymentType | null;
};

export const CartContext = createContext<CartType>({
  items: [],
  order: {},
  addItem: () => {},
  updateQuantity: () => {},
  total: 0,
  checkout: () => {},
  submitPayment: () => {},
  loading: false,
  payment: null,
});

const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<OrderType>({ id: "" });
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<PaymentType | null>(null);
  const storage = getStorage();
  const db = getFirestore();

  const addItem = (product: ProductType, productItem: ProductItem) => {
    const existingItem = items.find(
      (item) =>
        item.product.id === product.id &&
        item.productItem.name === productItem.name
    );

    if (existingItem) {
      updateQuantity(existingItem.id!, 1);
      return;
    }

    const newCartItem: CartItem = {
      id: randomUUID().split("-")[0],
      product,
      productItem,
      quantity: 1,
    };

    setItems([newCartItem, ...items]);
  };

  const updateQuantity = (itemId: string, amount: -1 | 1) => {
    setItems(
      items
        .map((item) =>
          item.id !== itemId
            ? item
            : { ...item, quantity: item.quantity + amount }
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total = items.reduce(
    (sum, item) => (sum += item.productItem.price * item.quantity),
    0
  );

  const checkout = async (deliveryDate: Date) => {
    const now = dayjs();
    const newOrder: OrderType = {
      id: randomUUID().split("-")[0],
      createdAt: now.toISOString(),
      total: total,
      uid: user?.uid!,
      status: "Pending",
      deliveryDateTime: dayjs(deliveryDate).format("dddd, MMM D YYYY • h:mm A"),
      orderItems: items.map((item) => ({
        id: item.id,
        productName: item.product.name,
        productImage: item.product.images[0].uri,
        productItem: {
          name: item.productItem.name,
          price: item.productItem.price,
          deliveryFee: item.productItem.deliveryFee,
          distance: item.productItem.distance,
        },
        quantity: item.quantity,
      })),
    };
    setOrder(newOrder);
    setItems([]);
    router.dismissTo("/(user)/menu");
    router.replace("/qrPayment");
  };

  const submitPayment = async (image: string) => {
    setLoading(true);

    let res = await createOrder(order);
    if (res.success) {
      console.log("Order successfully created", res);
    } else {
      Alert.alert("Order", res.msg);
    }

    const response = await fetch(image);
    const blob = await response.blob();
    const filename = `payment_proofs/${order.uid}_${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    const paymentData: PaymentType = {
      imageUrl: downloadURL,
      timestamp: Timestamp.now(),
      uid: order.uid,
      amount: order.total,
      id: order.id,
    };
    await addDoc(collection(db, "payment_uploads"), paymentData);
    setPayment(paymentData);
    setLoading(false);
    alert("Payment uploaded. Waiting for approval.");
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        total,
        checkout,
        order,
        loading,
        submitPayment,
        payment,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;

export const useCart = () => useContext(CartContext);
