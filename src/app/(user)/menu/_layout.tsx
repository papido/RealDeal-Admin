import { auth } from "@/config/firebase";
import { colors } from "@/src/constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { Link, Stack, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { Pressable } from "react-native";

export default function MenuStack() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  return (
    <Stack
      screenOptions={{
        headerLeft: () => (
          <Pressable onPress={handleLogout} style={{ paddingHorizontal: 10 }}>
            <SimpleLineIcons name="logout" size={24} color="black" />
          </Pressable>
        ),
        headerRight: () => (
          <Link href="/cart" asChild>
            <Pressable>
              {({ pressed }) => (
                <FontAwesome
                  name="shopping-cart"
                  size={25}
                  color={colors.neutral900}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          </Link>
        ),
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: colors.primaryLight,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Menu" }} />
    </Stack>
  );
}
