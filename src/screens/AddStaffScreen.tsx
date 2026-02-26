import React, { useState } from "react";
import {
  View, Text, Alert, StyleSheet,
  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { addStaff } from "../db/db";
import { Screen, Hero, Card, TextField, Dropdown, PrimaryButton } from "../ui/ui";
import { theme } from "../ui/theme";
import type { StaffStackParamList } from "../navigation/stacks/StaffStack";

type Nav = NativeStackNavigationProp<StaffStackParamList>;

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

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const LEVELS = [
    { label: "Weak",   color: "#EF4444" },
    { label: "Fair",   color: "#F97316" },
    { label: "Good",   color: "#EAB308" },
    { label: "Strong", color: "#22C55E" },
  ];
  const lvl = LEVELS[Math.max(0, score - 1)];
  return (
    <View style={ps.wrap}>
      <View style={ps.bars}>
        {[1, 2, 3, 4].map((n) => (
          <View key={n} style={[ps.bar, { backgroundColor: n <= score ? lvl.color : theme.colors.border }]} />
        ))}
      </View>
      <Text style={[ps.label, { color: lvl.color }]}>{lvl.label}</Text>
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
export default function AddStaffScreen() {
  const nav = useNavigation<Nav>();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [role,     setRole]     = useState<string>("staff");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const passwordsMatch = confirm.length === 0 || password === confirm;
  const canSave = !!username.trim() && !!password && password === confirm && !loading;

  const onSave = () => {
    const u = username.trim().toLowerCase();
    if (!u || u.length < 3) {
      Alert.alert("Invalid Username", "Username must be at least 3 characters.");
      return;
    }
    if (!password) {
      Alert.alert("Missing Password", "Please enter a password.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      addStaff(u, password, role);
      nav.goBack();
    } catch (e: any) {
      Alert.alert("Error", e.message);
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Hero
        title="Add Staff"
        subtitle="Create a new staff account"
        icon="person-add-outline"
        leftIcon="chevron-back"
        onLeftPress={() => nav.goBack()}
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
          {/* ── Account details ── */}
          <SectionLabel icon="person-outline" text="Account Details" />
          <Card style={{ gap: 2 }}>
            <TextField
              label="Username"
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/\s/g, ""))}
              icon="person-outline"
              placeholder="e.g. john_doe"
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
            <PasswordStrength password={password} />

            <TextField
              label="Confirm Password"
              value={confirm}
              onChangeText={setConfirm}
              icon="shield-outline"
              secureTextEntry={!showConf}
              autoCapitalize="none"
              autoCorrect={false}
              rightElement={<EyeToggle visible={showConf} onToggle={() => setShowConf((v) => !v)} />}
            />
            {!passwordsMatch && (
              <View style={s.feedbackRow}>
                <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                <Text style={[s.feedbackText, { color: "#EF4444" }]}>Passwords do not match</Text>
              </View>
            )}
            {passwordsMatch && confirm.length > 0 && (
              <View style={s.feedbackRow}>
                <Ionicons name="checkmark-circle-outline" size={13} color="#22C55E" />
                <Text style={[s.feedbackText, { color: "#22C55E" }]}>Passwords match</Text>
              </View>
            )}
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

          {/* ── Submit ── */}
          <View style={{ marginTop: 24 }}>
            <PrimaryButton
              title={loading ? "Creating…" : "Create Staff Account"}
              icon="person-add-outline"
              onPress={onSave}
              disabled={!canSave}
            />
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

const ps = StyleSheet.create({
  wrap:  { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6, marginBottom: 2 },
  bars:  { flex: 1, flexDirection: "row", gap: 4 },
  bar:   { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: 11, fontWeight: "700", width: 46, textAlign: "right" },
});

const s = StyleSheet.create({
  feedbackRow:  { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5, marginLeft: 2 },
  feedbackText: { fontSize: 12, fontWeight: "600" },
});