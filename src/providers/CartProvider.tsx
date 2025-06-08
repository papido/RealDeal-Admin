import dayjs from "dayjs";
import { randomUUID } from "expo-crypto";
import { router } from "expo-router";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { CartItem, OrderType, ProductType } from "../types";
import { useAuth } from "./authProvider";

type CartType = {
  items: CartItem[];
  order: OrderType;
  addItem: (product: ProductType, item: CartItem["productItem"]) => void;
  updateQuantity: (itemId: string, amount: -1 | 1) => void;
  total: number;
  checkout: () => void;
  loading: boolean;
};

export const CartContext = createContext<CartType>({
  items: [],
  order: {},
  addItem: () => {},
  updateQuantity: () => {},
  total: 0,
  checkout: () => {},
  loading: false,
});

const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<OrderType>({ id: "" });
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const addItem = (
    product: ProductType,
    productItem: CartItem["productItem"]
  ) => {
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

  const checkout = async () => {
    const now = dayjs();
    const newOrder: OrderType = {
      id: randomUUID().split("-")[0],
      createdAt: now.toISOString(),
      total: total,
      uid: user?.uid!,
      status: "New",
      orderItems: items.map((item) => ({
        id: item.id,
        productName: item.product.name,
        productImage: item.product.images[0].uri,
        productItem: {
          name: item.productItem.name,
          price: item.productItem.price,
        },
        quantity: item.quantity,
      })),
    };
    setOrder(newOrder);
    setItems([]);
    router.push("/qrPayment");
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;

export const useCart = () => useContext(CartContext);
