import { Timestamp } from "firebase/firestore";
import { ViewStyle } from "react-native";

export type ProductType = {
  id?: string;
  category?: string;
  images: ProductImageType[];
  name: string;
  description?: string;
  speciality?: string;
  price?: string;
  createdAt?: Date;
  items?: ProductItem[];
  uid?: string;
};

export type ProductItem = {
  name: string;
  price: number;
  deliveryFee: number;
  distance: number;
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
  id?: string;
  product: ProductType;
  productItem: ProductItem;
  quantity: number;
};

export const OrderStatusList: OrderStatus[] = [
  "Pending",
  "Paid",
  "Cooking",
  "Delivering",
  "Delivered",
];

export type OrderStatus =
  | "Pending"
  | "Paid"
  | "Cooking"
  | "Delivering"
  | "Delivered";

export type OrderType = {
  id?: string;
  createdAt?: string;
  total?: number;
  uid?: string;
  status?: OrderStatus;
  deliveryDateTime?: string;

  orderItems?: OrderItem[];
};

export type OrderItem = {
  id?: string;
  productName: ProductType["name"];
  productImage: ProductImageType["uri"];
  productItem: ProductItem;
  quantity: number;
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

export type PaymentType = {
  imageUrl?: string;
  timestamp?: Timestamp;
  uid?: string;
  amount?: number;
  id?: string;
};
