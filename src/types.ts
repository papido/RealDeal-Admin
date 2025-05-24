import { ViewStyle } from "react-native";

export type ProductType = {
  id?: string;
  category?: string;
  images: ProductImageType[];
  name: string;
  desc?: string;
  ingredients?: string;
  price?: number;
  uid?: string;
};

export type ProductImageType = {
  id: string;
  uri: string;
};

export type ImageUploadProps = {
  file?: any;
  onSelect: (file: any) => void;
  onClear: () => void;
  containerStyle?: ViewStyle;
  imageStyle?: ViewStyle;
  placeholder?: string;
};

export type PizzaSize = "S" | "M" | "L" | "XL";

export type CartItem = {
  id: string;
  product: ProductType;
  product_id: number;
  size: PizzaSize;
  quantity: number;
};

export const OrderStatusList: OrderStatus[] = [
  "New",
  "Cooking",
  "Delivering",
  "Delivered",
];

export type OrderStatus = "New" | "Cooking" | "Delivering" | "Delivered";

export type Order = {
  id: number;
  created_at: string;
  total: number;
  user_id: string;
  status: OrderStatus;

  order_items?: OrderItem[];
};

export type OrderItem = {
  id: number;
  product_id: number;
  products: ProductType;
  order_id: number;
  size: PizzaSize;
  quantity: number;
};

export type Profile = {
  id: string;
  group: string;
};

export type UserType = {
  uid?: string;
  email?: string | null;
  name: string | null;
  image?: any;
} | null;

export type ResponseType = {
  success: boolean;
  data?: any;
  msg?: string;
};

export type AuthContextType = {
  user: UserType;
  setUser: Function;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; msg?: string }>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; msg?: string }>;
  updateUserData: (userId: string) => Promise<void>;
};
