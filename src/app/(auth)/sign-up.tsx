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
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const resetFields = () => {
    setEmail("");
    setPassword("");
  };

  const validateInput = () => {
    setErrors("");
    if (!username) {
      setErrors("Username is required");
      return false;
    }
    if (!email) {
      setErrors("Email is required");
      return false;
    }
    if (!password) {
      setErrors("Password is required");
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    Keyboard.dismiss();
    const trimmed = username.trim() && email.trim() && password.trim();
    if (trimmed.length === 0) return;
    if (!validateInput()) {
      return;
    }
    setLoading(true);
    const res = await register(email, password, username);
    setLoading(false);
    console.log("register result: ", res);
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

      <Text style={{ color: "red" }}>{errors}</Text>

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
