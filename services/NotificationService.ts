import { firestore } from "@/config/firebase";
import * as Notifications from "expo-notifications";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface DeliveryNotificationData {
  orderId: string;
  customerUid: string;
  orderDetails?: {
    items: string[];
    totalAmount: number;
    deliveryAddress: string;
  };
}

class NotificationService {
  private notificationListener: any = null;
  private responseListener: any = null;

  constructor() {
    this.setupNotificationListeners();
  }

  setupNotificationListeners() {
    // Handle notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Handle notification responses (when user taps notification)
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        this.handleNotificationPress(response);
      });
  }

  handleNotificationReceived(notification: Notifications.Notification) {
    const { title, body, data } = notification.request.content;

    // Handle different notification types
    if (data?.type === "delivery") {
      console.log(`Delivery notification: ${title} - ${body}`);
      // You can show custom UI, update state, play custom sound, etc.
    }
  }

  handleNotificationPress(response: Notifications.NotificationResponse) {
    const { data } = response.notification.request.content;

    if (data?.type === "delivery" && data?.orderId) {
      // Navigate to order details screen
      console.log("Navigate to order:", data.orderId);
      // You can use your router here to navigate
      // router.push(`/orders/${data.orderId}`);
    }
  }

  // Get customer's push token from Firestore
  async getCustomerPushToken(customerUid: string): Promise<string | null> {
    try {
      const userDoc = await firestore()
        .collection("users")
        .doc(customerUid)
        .get();

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData?.expoPushToken || null;
      }

      return null;
    } catch (error) {
      console.error("Error fetching customer push token:", error);
      return null;
    }
  }

  // Send delivery notification via your backend
  async sendDeliveryNotification(
    data: DeliveryNotificationData
  ): Promise<boolean> {
    try {
      const customerToken = await this.getCustomerPushToken(data.customerUid);

      if (!customerToken) {
        console.log("Customer push token not found");
        return false;
      }

      // Call your backend API
      const response = await fetch(
        "https://real-deal-backend.vercel.app/send-delivery-notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add your auth headers here
          },
          body: JSON.stringify({
            pushToken: customerToken,
            orderId: data.orderId,
            title: "Order Delivered! 📦",
            body: `Your order #${data.orderId} has been successfully delivered.`,
            data: {
              type: "delivery",
              orderId: data.orderId,
              customerUid: data.customerUid,
              timestamp: new Date().toISOString(),
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Delivery notification sent:", result);
      return true;
    } catch (error) {
      console.error("Error sending delivery notification:", error);
      return false;
    }
  }

  // Send notification to multiple customers (batch delivery)
  async sendBatchDeliveryNotifications(
    deliveries: DeliveryNotificationData[]
  ): Promise<void> {
    const promises = deliveries.map((delivery) =>
      this.sendDeliveryNotification(delivery)
    );
    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Failed to send notification for order ${deliveries[index].orderId}:`,
          result.reason
        );
      }
    });
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new NotificationService();
