import { auth } from "@/config/firebase";
import { colors } from "@/src/constants/theme";
import { useAuth } from "@/src/providers/authProvider";
import { Feather } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/Button";

const SignInScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  const [showResend, setShowResend] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const validateInput = () => {
    setErrors("");
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
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    Keyboard.dismiss();
    if (!validateInput()) {
      return;
    }
    setLoading(true);
    const res = await login(trimmedEmail, trimmedPassword);
    setLoading(false);
    if (!res.success) {
      if (res.msg?.includes("verify your email")) {
        setShowResend(true);
      }
      Alert.alert("Sign in", res.msg);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Sign in" }} />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="jon@gmail.com"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Password</Text>
      <View style={{ position: "relative" }}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder=""
          style={[styles.input, { paddingRight: 40 }]}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: 10,
            top: 15,
          }}
        >
          <Feather
            name={showPassword ? "eye" : "eye-off"}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <Text style={{ color: "red" }}>{errors}</Text>

      <Button loading={loading} onPress={onSubmit}>
        <Text style={styles.textButton}>Sign In</Text>
      </Button>
      <Link href="/sign-up" style={styles.text}>
        Create an account
      </Link>

      <TouchableOpacity
        onPress={signInWithGoogle}
        style={{
          backgroundColor: "#4285F4",
          padding: 15,
          borderRadius: 8,
          margin: 10,
        }}
      >
        <Text
          style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
        >
          Sign in with Google
        </Text>
      </TouchableOpacity>

      {showResend && (
        <TouchableOpacity
          disabled={cooldown > 0}
          onPress={async () => {
            try {
              const tempUser = await auth().signInWithEmailAndPassword(
                email.trim(),
                password.trim()
              );

              if (tempUser.user.emailVerified) {
                Alert.alert(
                  "Already Verified",
                  "Your email is already verified."
                );
              } else {
                await tempUser.user.sendEmailVerification();
                Alert.alert(
                  "Verification Sent",
                  "Check your email to verify your account."
                );
                setCooldown(60); // start 60s cooldown
              }

              await auth().signOut(); // optional
              setShowResend(false); // hide again after sending
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          }}
          style={{
            backgroundColor: "#FFD700",
            padding: 15,
            borderRadius: 8,
            margin: 10,
          }}
        >
          <Text
            style={{
              color: cooldown > 0 ? "gray" : "black",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {cooldown > 0
              ? `Resend available in ${cooldown}s`
              : "Resend Verification Email"}
          </Text>
        </TouchableOpacity>
      )}
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

export default SignInScreen;
