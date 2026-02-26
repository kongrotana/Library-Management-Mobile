import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BooksStack   from "./stacks/BooksStack";
import BrowseStack  from "./stacks/BrowseStack";
import MembersStack from "./stacks/MembersStack";
import LoansStack   from "./stacks/LoansStack";
import StaffStack   from "./stacks/StaffStack";
import { theme } from "../ui/theme";

const Tab = createBottomTabNavigator();

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Books:   "book-outline",
  Browse:  "search-outline",
  Members: "people-outline",
  Loans:   "time-outline",
  Staff:   "shield-checkmark-outline",
};

export default function TabsNavigator() {
  const insets = useSafeAreaInsets();

  // Tab bar total height = content (56) + system nav bar inset
  const tabBarHeight = 56 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   theme.colors.primary,
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          height:            tabBarHeight,
          paddingTop:        6,
          paddingBottom:     insets.bottom > 0 ? insets.bottom : 8,
          borderTopColor:    theme.colors.border,
          borderTopWidth:    1,
          backgroundColor:   "#ffffff",
          elevation:         8,
          shadowColor:       "#000",
          shadowOffset:      { width: 0, height: -2 },
          shadowOpacity:     0.06,
          shadowRadius:      8,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={ICONS[route.name] ?? "ellipse-outline"}
            size={size}
            color={color}
          />
        ),
        tabBarLabelStyle: {
          fontSize:   11,
          fontWeight: "700",
          marginBottom: insets.bottom > 0 ? 0 : 4,
        },
      })}
    >
      <Tab.Screen name="Books"   component={BooksStack}   />
      <Tab.Screen name="Browse"  component={BrowseStack}  />
      <Tab.Screen name="Members" component={MembersStack} />
      <Tab.Screen name="Loans"   component={LoansStack}   />
      <Tab.Screen name="Staff"   component={StaffStack}   />
    </Tab.Navigator>
  );
}