import React, { useCallback, useState } from "react";
import { View, Text, FlatList, Alert, TextInput, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation, DrawerActions } from "@react-navigation/native";
import { getMembers, deleteMember, Member } from "../db/db";
import { Screen, Hero, Card, IconButton, FAB } from "../ui/ui";
import { theme } from "../ui/theme";

export default function MembersScreen() {
  const nav = useNavigation<any>();
  const [members, setMembers] = useState<Member[]>([]);
  const [q, setQ] = useState("");

  const load = useCallback(() => setMembers(getMembers()), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = q.trim()
    ? members.filter((m) =>
        m.name.toLowerCase().includes(q.toLowerCase()) ||
        m.phone.includes(q)
      )
    : members;

  const onDelete = (id: number) => {
    Alert.alert("Delete Member", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: () => {
          try { deleteMember(id); load(); }
          catch (e: any) { Alert.alert("Cannot Delete", e.message); }
        },
      },
    ]);
  };

  return (
    <Screen>
      <Hero
        title="Members"
        subtitle={`Total: ${members.length}`}
        icon="people-outline"
        leftIcon="menu-outline"
        onLeftPress={() => nav.dispatch(DrawerActions.openDrawer())}
      />

      <View style={{ flex: 1, padding: 16 }}>
        <View style={s.searchWrap}>
          <TextInput
            value={q} onChangeText={setQ}
            placeholder="Search name or phone..."
            placeholderTextColor="#94A3B8"
            style={s.search}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(i) => String(i.id)}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <Card style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{item.name}</Text>
                <Text style={s.sub}>{item.phone}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <IconButton
                  icon="create-outline"
                  color={theme.colors.primary}
                  onPress={() => nav.navigate("EditMember", { member: item })}
                />
                <IconButton
                  icon="trash-outline"
                  color={theme.colors.danger}
                  onPress={() => onDelete(item.id)}
                />
              </View>
            </Card>
          )}
          ListEmptyComponent={<Text style={s.empty}>No members yet.</Text>}
        />
      </View>

      <FAB icon="add" onPress={() => nav.navigate("AddMember")} />
    </Screen>
  );
}

const s = StyleSheet.create({
  title:  { fontSize: 15, fontWeight: "900", color: theme.colors.text },
  sub:    { marginTop: 2, color: theme.colors.sub, fontSize: 13 },
  empty:  { textAlign: "center", color: theme.colors.sub, marginTop: 28 },
  searchWrap: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
  },
  search: { color: theme.colors.text },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.colors.primary + "22",
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: "900", color: theme.colors.primary },
});