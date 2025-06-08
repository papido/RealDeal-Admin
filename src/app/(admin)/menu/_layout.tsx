import { colors } from "@/src/constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Pressable } from "react-native";

export default function MenuStack() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Menu",
          headerRight: () => (
            <Pressable onPress={() => router.replace("/menu/create")}>
              {({ pressed }) => (
                <FontAwesome
                  name="plus-square-o"
                  size={25}
                  color={colors.neutral900}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
