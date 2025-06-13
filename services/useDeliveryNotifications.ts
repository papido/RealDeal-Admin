// hooks/useDeliveryNotifications.ts
import { firestore } from "@/config/firebase";
import { useState } from "react";

export interface DeliveryNotificationData {
  orderId: string;
  customerUid: string;
  orderDetails?: {
    items: string[];
    totalAmount: number;
    deliveryAddress: string;
  };
}

export const useDeliveryNotifications = () => {
  const [sending, setSending] = useState(false);

  // Get customer's push token from Firestore
  const getCustomerPushToken = async (
    customerUid: string
  ): Promise<string | null> => {
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
  };

  // Send delivery notification via your backend
  const sendDeliveryNotification = async (data: DeliveryNotificationData) => {
    setSending(true);
    try {
      const customerToken = await getCustomerPushToken(data.customerUid);

      if (!customerToken) {
        console.log("Customer push token not found");
        return {
          success: false,
          error: "Customer does not have push notifications enabled",
        };
      }

      // Replace with your actual backend URL
      const response = await fetch(
        "https://real-deal-backend.vercel.app/api/notifications/send-delivery-notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add your auth headers here if needed
            // 'Authorization': 'Bearer YOUR_AUTH_TOKEN',
          },
          body: JSON.stringify({
            pushToken: customerToken,
            orderId: data.orderId,
            title: "Order Delivered! 📦",
            body: `Great news! Your order #${data.orderId} has been successfully delivered. Thank you for your purchase!`,
            data: {
              type: "delivery",
              orderId: data.orderId,
              customerUid: data.customerUid,
              timestamp: new Date().toISOString(),
              orderDetails: data.orderDetails
                ? JSON.stringify(data.orderDetails)
                : undefined,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.error || "Unknown error"
          }`
        );
      }

      const result = await response.json();
      console.log("Delivery notification sent:", result);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error sending delivery notification:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    } finally {
      setSending(false);
    }
  };

  // Send notification to multiple customers (batch delivery)
  const sendBatchDeliveryNotifications = async (
    deliveries: DeliveryNotificationData[]
  ) => {
    setSending(true);
    try {
      const notifications = [];

      // Prepare all notifications with tokens
      for (const delivery of deliveries) {
        const customerToken = await getCustomerPushToken(delivery.customerUid);

        if (customerToken) {
          notifications.push({
            pushToken: customerToken,
            orderId: delivery.orderId,
            title: "Order Delivered! 📦",
            body: `Great news! Your order #${delivery.orderId} has been successfully delivered. Thank you for your purchase!`,
            data: {
              type: "delivery",
              orderId: delivery.orderId,
              customerUid: delivery.customerUid,
              timestamp: new Date().toISOString(),
              orderDetails: delivery.orderDetails
                ? JSON.stringify(delivery.orderDetails)
                : undefined,
            },
          });
        }
      }

      if (notifications.length === 0) {
        return {
          success: false,
          error: "No customers have push notifications enabled",
        };
      }

      // Replace with your actual backend URL
      const response = await fetch(
        "https://real-deal-backend.vercel.app/api/notifications/send-batch-delivery-notifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add your auth headers here if needed
            // 'Authorization': 'Bearer YOUR_AUTH_TOKEN',
          },
          body: JSON.stringify({
            notifications,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.error || "Unknown error"
          }`
        );
      }

      const result = await response.json();
      console.log("Batch delivery notifications sent:", result);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error sending batch delivery notifications:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    } finally {
      setSending(false);
    }
  };

  // Test notification function (useful for development)
  const sendTestNotification = async (customerUid: string) => {
    setSending(true);
    try {
      const customerToken = await getCustomerPushToken(customerUid);

      if (!customerToken) {
        return {
          success: false,
          error: "Customer does not have push notifications enabled",
        };
      }

      // Replace with your actual backend URL
      const response = await fetch(
        "https://real-deal-backend.vercel.app/api/notifications/test-notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pushToken: customerToken,
            title: "Test Notification 🧪",
            body: "This is a test notification from your delivery app!",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error("Error sending test notification:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    } finally {
      setSending(false);
    }
  };

  return {
    sendDeliveryNotification,
    sendBatchDeliveryNotifications,
    sendTestNotification,
    sending,
  };
};
