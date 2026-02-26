import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MembersScreen    from "../../screens/MembersScreen";
import AddMemberScreen  from "../../screens/AddMemberScreen";
import EditMemberScreen from "../../screens/EditMemberScreen";

const Stack = createNativeStackNavigator();

export default function MembersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MembersHome" component={MembersScreen} />
      <Stack.Screen name="AddMember"   component={AddMemberScreen} />
      <Stack.Screen name="EditMember"  component={EditMemberScreen} />
    </Stack.Navigator>
  );
}