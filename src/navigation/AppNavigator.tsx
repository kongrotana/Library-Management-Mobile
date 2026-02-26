
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import BooksScreen from "../screens/BooksScreen";
import AddBookScreen from "../screens/AddBookScreen";

export type RootStackParamList = {
  MainTabs: undefined;
  AddBook: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Books" component={BooksScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" component={Tabs} options={{ title: "Library" }} />
        <Stack.Screen name="AddBook" component={AddBookScreen} options={{ title: "Add Book" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
