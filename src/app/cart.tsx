import { useCart } from "@/src/providers/CartProvider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "../components/Button";
import CartListItem from "../components/CartListItem";

const CartScreen = () => {
  const { items, total, checkout, loading } = useCart();

  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(9, 0, 0, 0); // Default to 9:00 AM
    return tomorrow;
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Restriction helpers
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  tomorrow.setHours(0, 0, 0, 0);

  const onDateChange = (event: any, selectedDate: any) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const updated = new Date(date);
      updated.setFullYear(selectedDate.getFullYear());
      updated.setMonth(selectedDate.getMonth());
      updated.setDate(selectedDate.getDate());
      setDate(updated);
    }
  };

  const onTimeChange = (event: any, selectedTime: any) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hour = selectedTime.getHours();
      const minute = selectedTime.getMinutes();

      if (hour < 9 || hour > 22 || (hour === 22 && minute > 0)) {
        Alert.alert(
          "Invalid Time",
          "Please select a time between 9:00 AM and 10:00 PM."
        );
        return;
      }

      const updated = new Date(date);
      updated.setHours(selectedTime.getHours());
      updated.setMinutes(selectedTime.getMinutes());
      setDate(updated);
    }
  };

  return (
    <View style={{ padding: 10 }}>
      <FlatList
        data={items}
        renderItem={({ item }) => <CartListItem cartItem={item} />}
        contentContainerStyle={{ gap: 10 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40 }}>
            Your cart is empty.
          </Text>
        }
      />

      {items.length > 0 && (
        <View style={{ marginTop: 20 }}>
          {/* Date Picker Section */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 5 }}>
              Select delivery date and time:
            </Text>

            {/* Date Picker */}
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={styles.dateInput}
            >
              <Text>📅 {date.toDateString()}</Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={tomorrow}
              />
            )}

            {/* Time Picker */}
            <Pressable
              onPress={() => setShowTimePicker(true)}
              style={styles.timeInput}
            >
              <Text>
                🕒{" "}
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Pressable>
            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}
          </View>

          {/* Total and Checkout */}
          <Text style={{ fontSize: 20, fontWeight: "500" }}>
            Total: RM{total.toFixed(2)}
          </Text>
          <Button
            onPress={() => checkout(date)}
            loading={loading}
            disabled={loading}
          >
            <Text>Checkout</Text>
          </Button>
        </View>
      )}
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  dateInput: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
    marginBottom: 10,
  },
  timeInput: { padding: 10, backgroundColor: "#eee", borderRadius: 5 },
});
