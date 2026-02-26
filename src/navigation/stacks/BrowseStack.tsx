import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BrowseBooksScreen from "../../screens/BrowseBooksScreen";

const Stack = createNativeStackNavigator();

export default function BrowseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrowseHome" component={BrowseBooksScreen} />
    </Stack.Navigator>
  );
}