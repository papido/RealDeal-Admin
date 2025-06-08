import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import Button from "../components/Button";

const index = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 10 }}>
      <Button onPress={() => router.push("/(user)/menu")}>
        <Text style={{ color: "white" }}>User</Text>
      </Button>

      <Button onPress={() => router.push("/(admin)")}>
        <Text style={{ color: "white" }}>Admin</Text>
      </Button>

      <Button onPress={() => router.push("/sign-in")}>
        <Text style={{ color: "white" }}>Sign In</Text>
      </Button>
    </View>
  );
};

export default index;
