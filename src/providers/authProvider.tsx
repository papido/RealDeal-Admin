import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { AuthContextType, UserType } from "@/src/types";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { Alert } from "react-native";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<ReturnType<
    typeof Notifications.addNotificationReceivedListener
  > | null>(null);
  const responseListener = useRef<ReturnType<
    typeof Notifications.addNotificationResponseReceivedListener
  > | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await updateUserData(firebaseUser.uid);
        if (userData) {
          setUser(userData);
          console.log("User data:", userData);
          router.replace("/");
        }
      } else {
        setUser(null);
        console.log("User logged out"); // Log when user is null
        cleanupNotifications();
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Separate useEffect to log user changes
  useEffect(() => {
    console.log("User state changed:", user);
  }, [user]);

  const setupNotifications = async (uid: string) => {
    try {
      // Check current permission status
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      console.log("📱 Current permission status:", existingStatus);

      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log("📱 Requested permission status:", finalStatus);
      }

      if (finalStatus !== "granted") {
        console.log("❌ Push notification permissions not granted");
        return;
      }

      const token = await registerForPushNotificationsAsync();
      console.log("🎯 Generated push token:", token);

      if (token) {
        setExpoPushToken(token);

        // Save to Firestore
        await firestore().collection("users").doc(uid).set(
          {
            expoPushToken: token,
          },
          { merge: true }
        );

        console.log("💾 Token saved to Firestore for user:", uid);
      }

      // Test if listeners are working
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log("🔔 [FOREGROUND] Notification Received:", notification);
          setNotification(notification);

          // Show an alert to confirm reception
          Alert.alert(
            "Order Received!",
            JSON.stringify(notification.request.content, null, 2)
          );
        });

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log("🔔 [INTERACTION] Notification Tapped:", response);
          Alert.alert(
            "Notification Tapped!",
            JSON.stringify(response.notification.request.content, null, 2)
          );
        });

      console.log("✅ Notification listeners set up successfully");
    } catch (err: any) {
      setError(err);
      console.error("❌ Notification setup error:", err);
    }
  };

  const cleanupNotifications = () => {
    notificationListener.current?.remove();
    responseListener.current?.remove();
    notificationListener.current = null;
    responseListener.current = null;
    setExpoPushToken(null);
    setNotification(null);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await auth().signInWithEmailAndPassword(email, password);
      const currentUser = auth().currentUser;
      if (currentUser) {
        const userData = await updateUserData(currentUser.uid);
        if (userData) {
          setUser(userData);
          await setupNotifications(currentUser.uid);
          router.replace("/"); // use replace to avoid going back to login
        }
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, msg: parseAuthError(error.message) };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    username: string
  ) => {
    try {
      setIsLoading(true);

      const response = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      await response.user.updateProfile({ displayName: username });

      // Save user to Firestore
      await firestore().collection("users").doc(response.user.uid).set({
        username,
        email,
        uid: response.user.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
        address: "",
      });

      // Redirect to sign-in page manually
      router.push("/(auth)/sign-in");

      return { success: true };
    } catch (error: any) {
      return { success: false, msg: parseAuthError(error.message) };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await auth().signOut();
    router.push("/(auth)/sign-in");
  };

  const updateUserData = async (uid: string): Promise<UserType | null> => {
    try {
      const docSnap = await firestore().collection("users").doc(uid).get();
      const data = docSnap.data();
      return {
        uid: data?.uid,
        email: data?.email || null,
        username: data?.username || null,
        image: data?.image || null,
        address: data?.address || null,
      };
    } catch (error) {
      console.error("Failed to update user data:", error);
      return null;
    }
  };

  const parseAuthError = (msg: string) => {
    if (msg.includes("(auth/invalid-email)")) return "Invalid email";
    if (msg.includes("(auth/invalid-credential)")) return "Wrong credentials";
    if (msg.includes("(auth/user-not-found)")) return "User not found";
    if (msg.includes("(auth/wrong-password)")) return "Wrong password";
    if (msg.includes("(auth/too-many-requests)"))
      return "Too many attempts. Try again later";
    if (msg.includes("(auth/email-already-in-use)"))
      return "Email already in use";
    if (msg.includes("(auth/weak-password)")) return "Password too weak";
    return "Authentication error";
  };

  const contextValue: AuthContextType = {
    user,
    setUser,
    login,
    logout,
    register,
    updateUserData,
    expoPushToken,
    notification,
    error,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
