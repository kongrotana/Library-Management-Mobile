import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoansScreen     from "../../screens/LoansScreen";
import IssueLoanScreen from "../../screens/IssueLoanScreen";

const Stack = createNativeStackNavigator();

export default function LoansStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoansHome"  component={LoansScreen} />
      <Stack.Screen name="IssueLoan"  component={IssueLoanScreen} />
    </Stack.Navigator>
  );
}