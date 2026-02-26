import React, { useState } from "react";
import {
  View, Text, Alert, StyleSheet,
  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";                    // ✅ correct package
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { updateStaff, Staff } from "../db/db";
import { Screen, Hero, Card, TextField, Dropdown, PrimaryButton } from "../ui/ui";
import { theme } from "../ui/theme";
import type { StaffStackParamList } from "../navigation/stacks/StaffStack";

type Nav   = NativeStackNavigationProp<StaffStackParamList, "EditStaff">;
type Route = RouteProp<StaffStackParamList, "EditStaff">;

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_OPTIONS = [
  { label: "Staff — Manage books, members & loans", value: "staff" },
  { label: "Administrator — Full system access",    value: "admin" },
];

const ROLE_PERMS: Record<string, { icon: string; color: string; perms: string[] }> = {
  staff: {
    icon:  "person-circle-outline",
    color: "#3B82F6",
    perms: ["View & manage books", "Issue & return loans", "Manage members"],
  },
  admin: {
    icon:  "shield-checkmark-outline",
    color: "#EF4444",
    perms: ["All staff permissions", "Manage staff accounts", "Full system access"],
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function RoleHint({ role }: { role: string }) {
  const cfg = ROLE_PERMS[role] ?? ROLE_PERMS.staff;
  return (
    <View style={[rh.wrap, { borderColor: cfg.color + "33", backgroundColor: cfg.color + "0a" }]}>
      <View style={rh.header}>
        <Ionicons name={cfg.icon as any} size={15} color={cfg.color} />
        <Text style={[rh.title, { color: cfg.color }]}>
          {role === "admin" ? "Administrator" : "Staff"} Permissions
        </Text>
      </View>
      {cfg.perms.map((p) => (
        <View key={p} style={rh.row}>
          <Ionicons name="checkmark-circle" size={13} color={cfg.color} />
          <Text style={[rh.perm, { color: cfg.color + "cc" }]}>{p}</Text>
        </View>
      ))}
    </View>
  );
}

function SectionLabel({ icon, text, style }: { icon: string; text: string; style?: object }) {
  return (
    <View style={[{ flexDirection: "row" as const, alignItems: "center" as const, gap: 6, marginBottom: 8 }, style]}>
      <Ionicons name={icon as any} size={13} color={theme.colors.sub} />
      <Text style={{ fontSize: 11, fontWeight: "700", color: theme.colors.sub, textTransform: "uppercase", letterSpacing: 0.8 }}>
        {text}
      </Text>
    </View>
  );
}

function EyeToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Ionicons
        name={visible ? "eye-off-outline" : "eye-outline"}
        size={20}
        color={theme.colors.sub}
      />
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function EditStaffScreen() {
  const nav   = useNavigation<Nav>();
  const route = useRoute<Route>();
  const staff: Staff = route.params.staff;

  const [username, setUsername] = useState(staff.username);
  const [password, setPassword] = useState(staff.password);
  const [role,     setRole]     = useState(staff.role);
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const hasChanges =
    username.trim().toLowerCase() !== staff.username ||
    password !== staff.password ||
    role     !== staff.role;

  const roleColor = role === "admin" ? "#EF4444" : "#3B82F6";
  const initials  = staff.username.slice(0, 2).toUpperCase();

  const onSave = () => {
    const u = username.trim().toLowerCase();
    if (!u || u.length < 3) {
      Alert.alert("Invalid Username", "Username must be at least 3 characters.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Missing Password", "Please enter a password.");
      return;
    }
    setLoading(true);
    try {
      updateStaff(staff.id, u, password, role);
      nav.goBack();
    } catch (e: any) {
      Alert.alert("Error", e.message);
      setLoading(false);
    }
  };

  const onBack = () => {
    if (!hasChanges) { nav.goBack(); return; }
    Alert.alert(
      "Discard Changes?",
      "You have unsaved changes. Go back anyway?",
      [
        { text: "Keep Editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => nav.goBack() },
      ]
    );
  };

  return (
    <Screen>
      <Hero
        title="Edit Staff"
        subtitle="Update staff account details"
        icon="create-outline"
        leftIcon="chevron-back"
        onLeftPress={onBack}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Profile card ── */}
          <Card style={s.profileCard}>
            <View style={[s.avatar, { backgroundColor: roleColor + "1a" }]}>
              <Text style={[s.avatarText, { color: roleColor }]}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.profileName}>{staff.username}</Text>
              <View style={[s.roleBadge, { backgroundColor: roleColor + "15", borderColor: roleColor + "40" }]}>
                <Ionicons
                  name={role === "admin" ? "shield-checkmark" : "person-circle"}
                  size={11}
                  color={roleColor}
                />
                <Text style={[s.roleText, { color: roleColor }]}>{role.toUpperCase()}</Text>
              </View>
            </View>
            <View style={s.idChip}>
              <Text style={s.idText}>ID #{staff.id}</Text>
            </View>
          </Card>

          {/* Unsaved changes indicator */}
          {hasChanges && (
            <View style={s.unsavedRow}>
              <Ionicons name="ellipse" size={8} color="#F97316" />
              <Text style={s.unsavedText}>Unsaved changes</Text>
            </View>
          )}

          {/* ── Account details ── */}
          <SectionLabel icon="person-outline" text="Account Details" style={{ marginTop: 16 }} />
          <Card style={{ gap: 2 }}>
            <TextField
              label="Username"
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/\s/g, ""))}
              icon="person-outline"
              placeholder="Username"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              secureTextEntry={!showPass}
              autoCapitalize="none"
              autoCorrect={false}
              rightElement={<EyeToggle visible={showPass} onToggle={() => setShowPass((v) => !v)} />}
            />
          </Card>

          {/* ── Role ── */}
          <SectionLabel icon="shield-outline" text="Role & Permissions" style={{ marginTop: 20 }} />
          <Card style={{ gap: 2 }}>
            <Dropdown
              label="Role"
              value={role}
              options={ROLE_OPTIONS}
              onSelect={(v) => setRole(String(v))}
              icon="shield-outline"
            />
            <RoleHint role={role} />
          </Card>

          {/* ── Actions ── */}
          <View style={{ marginTop: 24 }}>
            <PrimaryButton
              title={loading ? "Saving…" : "Save Changes"}
              icon="save-outline"
              onPress={onSave}
              disabled={!hasChanges || loading}
            />
            <TouchableOpacity style={s.discardBtn} onPress={onBack}>
              <Ionicons name="close-outline" size={17} color={theme.colors.sub} />
              <Text style={s.discardText}>Discard Changes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const rh = StyleSheet.create({
  wrap:   { borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 6, marginBottom: 4 },
  header: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  title:  { fontSize: 12, fontWeight: "800" },
  row:    { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  perm:   { fontSize: 12, fontWeight: "600" },
});

const s = StyleSheet.create({
  // Profile card
  profileCard:  { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar:       { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  avatarText:   { fontSize: 18, fontWeight: "900" },
  profileName:  { fontSize: 15, fontWeight: "800", color: theme.colors.text, marginBottom: 5 },
  roleBadge:    { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1, alignSelf: "flex-start" },
  roleText:     { fontSize: 11, fontWeight: "800" },
  idChip:       { backgroundColor: theme.colors.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: theme.colors.border },
  idText:       { fontSize: 12, fontWeight: "700", color: theme.colors.sub },

  // Unsaved
  unsavedRow:  { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  unsavedText: { fontSize: 12, color: "#F97316", fontWeight: "600" },

  // Discard button
  discardBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14 },
  discardText: { fontSize: 14, color: theme.colors.sub, fontWeight: "600" },
});