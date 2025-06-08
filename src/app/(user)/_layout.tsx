import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="cutlery" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="th-list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color="black" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
