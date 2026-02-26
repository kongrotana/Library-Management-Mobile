import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BooksScreen    from "../../screens/BooksScreen";
import AddBookScreen  from "../../screens/AddBookScreen";
import EditBookScreen from "../../screens/EditBookScreen";

const Stack = createNativeStackNavigator();

export default function BooksStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BooksHome" component={BooksScreen} />
      <Stack.Screen name="AddBook"   component={AddBookScreen} />
      <Stack.Screen name="EditBook"  component={EditBookScreen} />
    </Stack.Navigator>
  );
}