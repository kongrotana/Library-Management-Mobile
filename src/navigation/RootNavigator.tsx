import React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, useAuth } from "../auth/auth";
import AuthStack from "./AuthStack";
import AppDrawer from "./AppDrawer";

function RootInner() {
  const { userToken, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return userToken ? <AppDrawer /> : <AuthStack />;
}

export default function RootNavigator() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootInner />
      </NavigationContainer>
    </AuthProvider>
  );
}