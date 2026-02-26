import React, { useState } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ViewStyle, KeyboardTypeOptions, Modal, FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { theme } from "./theme";

// ─── Screen ───────────────────────────────────────────────────────────────────
// "bottom" is excluded from edges — the navigator's tabBar handles it,
// so icons never overlap the system navigation bar.
export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <SafeAreaView style={[s.screen, style]} edges={["top", "left", "right"]}>
      <StatusBar style="auto" />
      {children}
    </SafeAreaView>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export function Hero({
  title, subtitle, icon = "library-outline",
  leftIcon, onLeftPress, rightIcon, onRightPress,
}: {
  title: string; subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  leftIcon?: keyof typeof Ionicons.glyphMap; onLeftPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap; onRightPress?: () => void;
}) {
  const hasTopRow = (leftIcon && onLeftPress) || (rightIcon && onRightPress);
  return (
    <LinearGradient colors={["#111827", "#1F2937"]} style={s.hero}>
      {hasTopRow && (
        <View style={s.heroTopRow}>
          {leftIcon && onLeftPress ? (
            <Pressable
              onPress={onLeftPress}
              style={({ pressed }) => [s.heroAction, { opacity: pressed ? 0.7 : 1 }]}
              android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
            >
              <Ionicons name={leftIcon} size={20} color="#fff" />
            </Pressable>
          ) : <View style={{ width: 40, height: 40 }} />}

          {rightIcon && onRightPress ? (
            <Pressable
              onPress={onRightPress}
              style={({ pressed }) => [s.heroAction, { opacity: pressed ? 0.7 : 1 }]}
              android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
            >
              <Ionicons name={rightIcon} size={20} color="#fff" />
            </Pressable>
          ) : <View style={{ width: 40, height: 40 }} />}
        </View>
      )}
      <View style={s.heroRow}>
        <View style={s.heroIcon}>
          <Ionicons name={icon} size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.heroTitle}>{title}</Text>
          {!!subtitle && <Text style={s.heroSub}>{subtitle}</Text>}
        </View>
      </View>
    </LinearGradient>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────
export function PrimaryButton({
  title, onPress, icon, variant = "primary", disabled = false,
}: {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "primary" | "danger" | "ghost" | "warning";
  disabled?: boolean;
}) {
  const bg =
    variant === "primary" ? theme.colors.primary :
    variant === "danger"  ? theme.colors.danger  :
    variant === "warning" ? theme.colors.warning :
    "transparent";
  const border    = variant === "ghost" ? theme.colors.border : "transparent";
  const textColor = variant === "ghost" ? theme.colors.text   : "#fff";

  return (
    <Pressable
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, borderColor: border },
        { opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
      ]}
      onPress={onPress}
      disabled={disabled}
      android_ripple={disabled ? undefined : { color: "rgba(255,255,255,0.2)" }}
    >
      {!!icon && <Ionicons name={icon} size={18} color={textColor} style={{ marginRight: 8 }} />}
      <Text style={[s.btnText, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

// ─── IconButton ───────────────────────────────────────────────────────────────
export function IconButton({
  icon, onPress, color = theme.colors.text,
}: {
  icon: keyof typeof Ionicons.glyphMap; onPress: () => void; color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
      android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: true }}
    >
      <Ionicons name={icon} size={18} color={color} />
    </Pressable>
  );
}

// ─── TextField ────────────────────────────────────────────────────────────────
export function TextField({
  label, value, onChangeText, placeholder, icon,
  secureTextEntry, keyboardType,
  autoCapitalize = "sentences",
  autoCorrect = true,
  rightElement,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputWrap}>
        {!!icon && (
          <Ionicons name={icon} size={18} color={theme.colors.sub} style={{ marginRight: 8 }} />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          style={s.input}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
        {!!rightElement && <View style={{ marginLeft: 8 }}>{rightElement}</View>}
      </View>
    </View>
  );
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────
export type DropdownOption = { label: string; value: string | number };

export function Dropdown({
  label, value, options, onSelect, placeholder = "Select...", icon,
}: {
  label: string;
  value: string | number | null;
  options: DropdownOption[];
  onSelect: (val: string | number) => void;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const [open, setOpen] = useState(false);
  const insets   = useSafeAreaInsets();
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={s.label}>{label}</Text>
      <Pressable
        style={({ pressed }) => [s.inputWrap, { opacity: pressed ? 0.8 : 1 }]}
        onPress={() => setOpen(true)}
      >
        {!!icon && <Ionicons name={icon} size={18} color={theme.colors.sub} style={{ marginRight: 8 }} />}
        <Text style={[s.input, { flex: 1, paddingVertical: 2 }, !selected && { color: "#94A3B8" }]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={theme.colors.sub} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setOpen(false)}>
          {/* Inner Pressable stops tap-through closing when touching the sheet */}
          <Pressable>
            <View style={[s.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
              <View style={s.modalHandle} />
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>{label}</Text>
                <Pressable onPress={() => setOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={22} color={theme.colors.sub} />
                </Pressable>
              </View>
              <FlatList
                data={options}
                keyExtractor={(i) => String(i.value)}
                style={{ maxHeight: 360 }}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      s.modalItem,
                      item.value === value && s.modalItemOn,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => { onSelect(item.value); setOpen(false); }}
                  >
                    <Text style={[s.modalItemText, item.value === value && { color: theme.colors.primary }]}>
                      {item.label}
                    </Text>
                    {item.value === value && (
                      <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                    )}
                  </Pressable>
                )}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── DatePickerField ──────────────────────────────────────────────────────────
export function DatePickerField({
  label, value, onChange,
}: {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
}) {
  const days = Array.from({ length: 31 }, (_, i) => ({
    label: String(i + 1).padStart(2, "0"), value: i + 1,
  }));
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ].map((m, i) => ({ label: m, value: i + 1 }));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => {
    const y = currentYear - 2 + i;
    return { label: String(y), value: y };
  });

  const set = (field: "day" | "month" | "year", val: number) => {
    const d = new Date(value);
    if (field === "day")   d.setDate(val);
    if (field === "month") d.setMonth(val - 1);
    if (field === "year")  d.setFullYear(val);
    onChange(d);
  };

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={s.label}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ width: 70 }}>
          <Dropdown label="Day"   value={value.getDate()}      options={days}   onSelect={(v) => set("day",   Number(v))} placeholder="DD" />
        </View>
        <View style={{ flex: 1 }}>
          <Dropdown label="Month" value={value.getMonth() + 1} options={months} onSelect={(v) => set("month", Number(v))} placeholder="Month" />
        </View>
        <View style={{ width: 90 }}>
          <Dropdown label="Year"  value={value.getFullYear()}  options={years}  onSelect={(v) => set("year",  Number(v))} placeholder="YYYY" />
        </View>
      </View>
    </View>
  );
}

// ─── FAB ──────────────────────────────────────────────────────────────────────
// Dynamically positions above the system nav bar using safe area insets.
export function FAB({ icon = "add", onPress }: { icon?: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      style={({ pressed }) => [
        s.fab,
        // Sit 8px above the tab bar / system nav bar, minimum 16px from edge
        { bottom: Math.max(insets.bottom, 16) + 8 },
        { opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.3)", borderless: true }}
    >
      <Ionicons name={icon} size={22} color="#fff" />
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Screen
  screen: { flex: 1, backgroundColor: theme.colors.bg },

  // Hero
  hero:       { padding: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  heroTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  heroAction: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  heroRow:    { flexDirection: "row", alignItems: "center" },
  heroIcon:   { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  heroTitle:  { color: "#fff", fontSize: 18, fontWeight: "900" },
  heroSub:    { color: theme.colors.heroSub, marginTop: 2 },

  // Card
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius, padding: 14, borderWidth: 1, borderColor: theme.colors.border },

  // Form
  label:     { fontWeight: "800", color: theme.colors.text, marginBottom: 6 },
  inputWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius, backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 10 },
  input:     { flex: 1, color: theme.colors.text },

  // Buttons
  btn:     { marginTop: 14, borderRadius: theme.radius, paddingVertical: 13, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1 },
  btnText: { fontWeight: "900" },
  iconBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.muted, borderWidth: 1, borderColor: theme.colors.border },

  // FAB — bottom set dynamically, not here
  fab: { position: "absolute", right: 16, width: 54, height: 54, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4 },

  // Dropdown modal sheet
  modalOverlay:  { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet:    { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHandle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", alignSelf: "center", marginTop: 10, marginBottom: 4 },
  modalHeader:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  modalTitle:    { fontWeight: "900", fontSize: 16, color: theme.colors.text },
  modalItem:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  modalItemOn:   { backgroundColor: "#EFF6FF" },
  modalItemText: { fontWeight: "700", color: theme.colors.text, fontSize: 15 },
});