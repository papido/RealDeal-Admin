import { createOrder } from "@/services/orderService";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import dayjs from "dayjs";
import { randomUUID } from "expo-crypto";
import * as Location from "expo-location";
import { router } from "expo-router";
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
  getLocation: () => Promise<Location.LocationObject>;
  location: Location.LocationObject;
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
  getLocation: async () => {
    return {
      coords: {
        accuracy: 0,
        altitude: 0,
        altitudeAccuracy: null,
        heading: 0,
        latitude: 0,
        longitude: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    };
  },
  location: {
    coords: {
      accuracy: 0,
      altitude: 0,
      altitudeAccuracy: null,
      heading: 0,
      latitude: 0,
      longitude: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  },
});

const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<OrderType>({ id: "" });
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<PaymentType | null>(null);
  const [location, setLocation] = useState<Location.LocationObject>({
    coords: {
      accuracy: 0,
      altitude: 0,
      altitudeAccuracy: null,
      heading: 0,
      latitude: 0,
      longitude: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  });

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

    try {
      let res = await createOrder(order);
      if (res.success) {
        console.log("Order successfully created", res);
      } else {
        Alert.alert("Order", res.msg);
        setLoading(false);
        return;
      }

      // Convert image to blob
      const response = await fetch(image);
      const blob = await response.blob();

      // Create storage reference and upload using the new API
      const filename = `payment_proofs/${order.uid}_${Date.now()}.jpg`;
      const storageRef = storage().ref(filename);
      await storageRef.put(blob);
      const downloadURL = await storageRef.getDownloadURL();

      // Create payment data and add to Firestore using the new API
      const paymentData: PaymentType = {
        imageUrl: downloadURL,
        timestamp: firestore.Timestamp.now(),
        uid: order.uid,
        amount: order.total,
        id: order.id,
      };

      await firestore().collection("payment_uploads").add(paymentData);

      setPayment(paymentData);
      setLoading(false);
      alert("Payment uploaded. Waiting for approval.");
    } catch (error) {
      console.error("Error submitting payment:", error);
      Alert.alert("Error", "Failed to submit payment. Please try again.");
      setLoading(false);
    }
  };

  const getLocation = async (): Promise<Location.LocationObject> => {
    const location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    return location;
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
        getLocation,
        location,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;

export const useCart = () => useContext(CartContext);
