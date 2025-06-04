import { auth } from "@/config/firebase";
import Button from "@/src/components/Button";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React from "react";
import { Text, View } from "react-native";

const ProfileScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
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
