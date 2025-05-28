import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import Button from "../components/Button";

const index = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 10 }}>
      <Link href={"/(user)/menu"} asChild>
        <Button>
          <Text style={{ color: "white" }}>User</Text>
        </Button>
      </Link>
      <Link href={"/(admin)"} asChild>
        <Button>
          <Text style={{ color: "white" }}>Admin</Text>
        </Button>
      </Link>
      <Link href={"/sign-in"} asChild>
        <Button>
          <Text style={{ color: "white" }}>Sign In</Text>
        </Button>
      </Link>
    </View>
  );
};

export default index;
