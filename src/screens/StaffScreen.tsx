import React, { useCallback, useMemo, useState } from "react";
import {
  View, Text, FlatList, Alert, StyleSheet,
  TextInput, TouchableOpacity,
} from "react-native";
import { useFocusEffect, useNavigation, DrawerActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { getStaffList, deleteStaff, Staff } from "../db/db";
import { Screen, Hero, Card, IconButton, FAB } from "../ui/ui";
import { theme } from "../ui/theme";
import type { StaffStackParamList } from "../navigation/stacks/StaffStack";

type Nav = NativeStackNavigationProp<StaffStackParamList>;

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CFG: Record<string, { color: string; icon: string }> = {
  admin: { color: "#EF4444", icon: "shield-checkmark" },
  staff: { color: "#3B82F6", icon: "person-circle"    },
};
function roleCfg(role: string) {
  return ROLE_CFG[role] ?? { color: theme.colors.sub, icon: "person" };
}

// ─── Stat badge ───────────────────────────────────────────────────────────────
function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[sb.wrap, { borderColor: color + "33", backgroundColor: color + "11" }]}>
      <Text style={[sb.value, { color }]}>{value}</Text>
      <Text style={[sb.label, { color: color + "99" }]}>{label}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  wrap:  { flex: 1, borderRadius: 12, borderWidth: 1, padding: 10, alignItems: "center" },
  value: { fontSize: 22, fontWeight: "900" },
  label: { fontSize: 11, fontWeight: "600", marginTop: 2 },
});

// ─── Staff card ───────────────────────────────────────────────────────────────
function StaffCard({
  item, onEdit, onDelete,
}: {
  item: Staff; onEdit: () => void; onDelete: () => void;
}) {
  const cfg      = roleCfg(item.role);
  const initials = item.username.slice(0, 2).toUpperCase();

  return (
    <Card style={sc.card}>
      <View style={[sc.avatar, { backgroundColor: cfg.color + "1a" }]}>
        <Text style={[sc.initials, { color: cfg.color }]}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={sc.username}>{item.username}</Text>
        <View style={sc.badgeRow}>
          <View style={[sc.badge, { backgroundColor: cfg.color + "15", borderColor: cfg.color + "40" }]}>
            <Ionicons name={cfg.icon as any} size={11} color={cfg.color} />
            <Text style={[sc.badgeText, { color: cfg.color }]}>{item.role.toUpperCase()}</Text>
          </View>
          <Text style={sc.idText}>ID #{item.id}</Text>
        </View>
      </View>
      <View style={sc.actions}>
        <IconButton icon="create-outline" color={theme.colors.primary} onPress={onEdit}   />
        <IconButton icon="trash-outline"  color={theme.colors.danger}  onPress={onDelete} />
      </View>
    </Card>
  );
}
const sc = StyleSheet.create({
  card:      { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar:    { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  initials:  { fontSize: 16, fontWeight: "900" },
  username:  { fontSize: 15, fontWeight: "800", color: theme.colors.text },
  badgeRow:  { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  badge:     { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: "800" },
  idText:    { fontSize: 11, color: theme.colors.sub },
  actions:   { flexDirection: "row", gap: 4 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function StaffScreen() {
  const nav = useNavigation<Nav>();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [query,     setQuery]     = useState("");

  const load = useCallback(() => setStaffList(getStaffList()), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const adminCount = useMemo(() => staffList.filter((s) => s.role === "admin").length, [staffList]);
  const staffCount = useMemo(() => staffList.filter((s) => s.role === "staff").length, [staffList]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staffList;
    return staffList.filter(
      (s) => s.username.toLowerCase().includes(q) || s.role.toLowerCase().includes(q)
    );
  }, [staffList, query]);

  const onDelete = (item: Staff) => {
    Alert.alert(
      "Remove Staff Member",
      `Remove "${item.username}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove", style: "destructive",
          onPress: () => {
            try   { deleteStaff(item.id); load(); }
            catch (e: any) { Alert.alert("Cannot Remove", e.message); }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <Hero
        title="Staff"
        subtitle="Manage library staff accounts"
        icon="shield-checkmark-outline"
        leftIcon="menu-outline"
        onLeftPress={() => nav.dispatch(DrawerActions.openDrawer())}
      />

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Stats */}
        <View style={s.statsRow}>
          <StatBadge label="Total"  value={staffList.length} color={theme.colors.primary} />
          <View style={{ width: 10 }} />
          <StatBadge label="Admins" value={adminCount}       color="#EF4444" />
          <View style={{ width: 10 }} />
          <StatBadge label="Staff"  value={staffCount}       color="#3B82F6" />
        </View>

        {/* Search */}
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={17} color={theme.colors.sub} style={{ marginRight: 8 }} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by name or role…"
            placeholderTextColor={theme.colors.sub}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={17} color={theme.colors.sub} />
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(i) => String(i.id)}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <StaffCard
              item={item}
              onEdit={()   => nav.navigate("EditStaff", { staff: item })}
              onDelete={() => onDelete(item)}
            />
          )}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Ionicons name="people-outline" size={44} color={theme.colors.sub + "55"} />
              <Text style={s.emptyTitle}>{query ? "No results found" : "No staff yet"}</Text>
              <Text style={s.emptySub}>
                {query ? `Nothing matched "${query}"` : 'Tap "+" to add a staff member'}
              </Text>
            </View>
          }
        />
      </View>

      <FAB icon="add" onPress={() => nav.navigate("AddStaff")} />
    </Screen>
  );
}

const s = StyleSheet.create({
  statsRow:   { flexDirection: "row", marginTop: 16, marginBottom: 14 },
  searchRow:  { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
  searchInput:{ flex: 1, fontSize: 14, color: theme.colors.text, paddingVertical: 0 },
  emptyWrap:  { alignItems: "center", marginTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: theme.colors.sub },
  emptySub:   { fontSize: 13, color: theme.colors.sub + "88" },
});