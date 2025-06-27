import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import Button from "../components/Button";
import TestPushNotification from "./testPushNotification";

const Index = () => {
  // const { user } = useAuth();

  // if (user) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <Text>Welcome {user.username || user.phoneNumber}</Text>
  //     </View>
  //   );
  // }

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <Text style={{ textAlign: "center", fontSize: 24, marginBottom: 30 }}>
        Choose Authentication Method
      </Text>

      <Button onPress={() => router.push("/(admin)")}>
        <Text style={{ color: "white" }}>Admin</Text>
      </Button>

      <Button onPress={() => router.push("/sign-in")}>
        <Text style={{ color: "white" }}>Sign In</Text>
      </Button>

      <TestPushNotification />
    </View>
  );
};

export default Index;
