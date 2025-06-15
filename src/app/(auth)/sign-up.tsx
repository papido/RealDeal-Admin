import { colors } from "@/src/constants/theme";
import { useAuth } from "@/src/providers/authProvider";
import { Link, Stack } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Button from "../../components/Button";

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const resetFields = () => {
    setEmail("");
    setPassword("");
  };

  const onSubmit = async () => {
    Keyboard.dismiss();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
      Alert.alert("Sign up", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    const res = await register(trimmedEmail, trimmedPassword, trimmedUsername);
    setLoading(false);
    console.log("register  ", res);
    if (!res.success) {
      Alert.alert("Sign up", res.msg);
    }
    resetFields();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Sign up" }} />

      <Text style={styles.label}>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="jonmill"
        style={styles.input}
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="jon@gmail.com"
        style={styles.input}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder=""
        style={styles.input}
        secureTextEntry
      />

      <Button loading={loading} onPress={onSubmit}>
        <Text style={styles.textButton}>Sign Up</Text>
      </Button>
      <Link href="/sign-in" style={styles.text}>
        Sign in
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: "center",
    flex: 1,
  },
  label: {
    color: "gray",
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    marginTop: 5,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 5,
  },
  textButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: colors.dark.text,
    marginVertical: 10,
  },
  text: {
    alignSelf: "center",
    fontWeight: "bold",
    color: colors.light.text,
    marginVertical: 10,
  },
});

export default SignUpScreen;
