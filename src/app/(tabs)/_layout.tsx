import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="index" />
    </Tabs>
  );
};

export default _layout;

const styles = StyleSheet.create({});
