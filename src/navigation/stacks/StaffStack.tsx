import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StaffScreen     from "../../screens/StaffScreen";
import AddStaffScreen  from "../../screens/AddStaffScreen";
import EditStaffScreen from "../../screens/EditStaffScreen";
import type { Staff } from "../../db/db";

export type StaffStackParamList = {
  StaffHome: undefined;
  AddStaff:  undefined;
  EditStaff: { staff: Staff };
};

const Stack = createNativeStackNavigator<StaffStackParamList>();

export default function StaffStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="StaffHome" component={StaffScreen}     />
      <Stack.Screen name="AddStaff"  component={AddStaffScreen}  />
      <Stack.Screen name="EditStaff" component={EditStaffScreen} />
    </Stack.Navigator>
  );
}