// app/(admin)/orders/list.tsx
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { SafeAreaView } from "react-native-safe-area-context";

// If you're routing via expo-router, import the components dynamically:
import ActiveScreen from "./active";
import ArchiveScreen from "./archive";
import PendingScreen from "./pending";

const Tab = createMaterialTopTabNavigator();

export default function OrderListScreen() {
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "white" }}>
      <Tab.Navigator>
        <Tab.Screen
          name="index"
          component={PendingScreen}
          options={{ title: "PENDING" }}
        />
        <Tab.Screen
          name="active"
          component={ActiveScreen}
          options={{ title: "ACTIVE" }}
        />
        <Tab.Screen
          name="archive"
          component={ArchiveScreen}
          options={{ title: "ARCHIVE" }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
