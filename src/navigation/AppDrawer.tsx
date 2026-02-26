import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import TabsNavigator     from "./TabsNavigator";
import AboutScreen       from "../screens/AboutScreen";
import BrowseBooksScreen from "../screens/BrowseBooksScreen";
import MembersScreen     from "../screens/MembersScreen";
import LoansScreen       from "../screens/LoansScreen";
import StaffScreen       from "../screens/StaffScreen";
import { theme }         from "../ui/theme";
import { useAuth }       from "../auth/auth";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const { signOut, currentUser } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <View style={s.header}>
        <View style={s.headerIcon}>
          <Ionicons name="library-outline" size={28} color="#fff" />
        </View>
        <Text style={s.headerTitle}>Library App</Text>
        <Text style={s.headerSub}>Management System</Text>
        {currentUser && (
          <View style={s.userBadge}>
            <Ionicons name="person-circle-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={s.userText}>{currentUser.username} · {currentUser.role}</Text>
          </View>
        )}
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 8 }}>
        <DrawerItemList {...props} />
        <View style={s.divider} />
        <DrawerItem
          label="Logout"
          onPress={signOut}
          icon={({ size }) => <Ionicons name="log-out-outline" size={size} color={theme.colors.danger} />}
          labelStyle={{ color: theme.colors.danger, fontWeight: "800" }}
        />
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor:      theme.colors.primary,
        drawerInactiveTintColor:    theme.colors.text,
        drawerActiveBackgroundColor:"#EFF6FF",
        drawerStyle:      { backgroundColor: "#fff", width: 280 },
        drawerLabelStyle: { fontWeight: "800" },
        drawerItemStyle:  { borderRadius: 12, marginHorizontal: 8 },
      }}
    >
      <Drawer.Screen name="Home"          component={TabsNavigator}     options={{ title: "Home",         drawerIcon: ({ color, size }) => <Ionicons name="home-outline"                  size={size} color={color} /> }} />
      <Drawer.Screen name="DrawerBooks"   component={TabsNavigator}     options={{ title: "Books",        drawerIcon: ({ color, size }) => <Ionicons name="book-outline"                  size={size} color={color} /> }} />
      <Drawer.Screen name="DrawerBrowse"  component={BrowseBooksScreen} options={{ title: "Browse Books", drawerIcon: ({ color, size }) => <Ionicons name="search-outline"                size={size} color={color} /> }} />
      <Drawer.Screen name="DrawerMembers" component={MembersScreen}     options={{ title: "Members",      drawerIcon: ({ color, size }) => <Ionicons name="people-outline"                size={size} color={color} /> }} />
      <Drawer.Screen name="DrawerLoans"   component={LoansScreen}       options={{ title: "Loans",        drawerIcon: ({ color, size }) => <Ionicons name="time-outline"                  size={size} color={color} /> }} />
      <Drawer.Screen name="DrawerStaff"   component={StaffScreen}       options={{ title: "Staff",        drawerIcon: ({ color, size }) => <Ionicons name="shield-checkmark-outline"      size={size} color={color} /> }} />
      <Drawer.Screen name="About"         component={AboutScreen}       options={{ title: "About",        drawerIcon: ({ color, size }) => <Ionicons name="information-circle-outline"    size={size} color={color} /> }} />
    </Drawer.Navigator>
  );
}

const s = StyleSheet.create({
  header:      { backgroundColor: "#111827", padding: 20, paddingTop: 24, paddingBottom: 24 },
  headerIcon:  { width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "900" },
  headerSub:   { color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 2 },
  userBadge:   { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  userText:    { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "700" },
  divider:     { height: 1, backgroundColor: theme.colors.border, marginHorizontal: 16, marginVertical: 8 },
});