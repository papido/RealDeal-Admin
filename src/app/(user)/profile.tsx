import { auth } from "@/config/firebase";
import Button from "@/src/components/Button";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const ProfileScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await auth().signOut();
    router.replace("/");
  };
  return (
    <View>
      <Button onPress={handleLogout}>
        <Text>Sign Out</Text>
      </Button>
    </View>
  );
};

export default ProfileScreen;
