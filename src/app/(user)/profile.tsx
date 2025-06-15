import Button from "@/src/components/Button";
import { useAuth } from "@/src/providers/authProvider";
import React from "react";
import { Text, View } from "react-native";

const ProfileScreen = () => {
  const { logout } = useAuth();

  return (
    <View>
      <Button onPress={logout}>
        <Text>Sign Out</Text>
      </Button>
    </View>
  );
};

export default ProfileScreen;
