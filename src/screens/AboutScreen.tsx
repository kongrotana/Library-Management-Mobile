import React from "react";
import {
  View, Text, Pressable, Linking, Alert,
  StyleSheet, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../auth/auth";
import { Screen, Hero, Card, PrimaryButton } from "../ui/ui";
import { theme } from "../ui/theme";

async function open(url: string) {
  try {
    const ok = await Linking.canOpenURL(url);
    if (!ok) return Alert.alert("Cannot open", url);
    await Linking.openURL(url);
  } catch {
    Alert.alert("Error", "Cannot open link");
  }
}

function RowLink({
  icon, title, subtitle, onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [s.row, { opacity: pressed ? 0.7 : 1 }]}
      onPress={onPress}
      android_ripple={{ color: "rgba(0,0,0,0.06)" }}
    >
      <View style={s.rowIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.rowSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.sub} />
    </Pressable>
  );
}

export default function AboutScreen() {
  const nav    = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();

  const onLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: signOut },
      ]
    );
  };

  return (
    <Screen>
      <Hero
        title="About"
        subtitle="Library Management Mobile"
        icon="information-circle-outline"
        leftIcon="arrow-back-outline"
        onLeftPress={() => nav.goBack()}
      />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 12,
          // Ensure logout button clears the system nav bar
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* About */}
        <Card>
          <Text style={s.sectionTitle}>About App</Text>
          <Text style={s.p}>
            Simple Library Management app (Books, Browse, Members, Loans). Offline-first using SQLite.
          </Text>
          <View style={s.pillRow}>
            <View style={s.pill}>
              <Ionicons name="phone-portrait-outline" size={14} color={theme.colors.sub} />
              <Text style={s.pillText}>Mobile</Text>
            </View>
            <View style={s.pill}>
              <Ionicons name="cloud-offline-outline" size={14} color={theme.colors.sub} />
              <Text style={s.pillText}>Offline</Text>
            </View>
            <View style={s.pill}>
              <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.sub} />
              <Text style={s.pillText}>Secure</Text>
            </View>
          </View>
        </Card>

        {/* Social */}
        <Card>
          <Text style={s.sectionTitle}>Follow Our Social</Text>
          <RowLink
            icon="logo-facebook"
            title="Facebook"
            subtitle="facebook.com/krotanaofficial"
            onPress={() => open("https://facebook.com/krotanaofficial")}
          />
          <RowLink
            icon="send-outline"
            title="Telegram"
            subtitle="t.me/kongrotanaofficialchannel"
            onPress={() => open("https://t.me/kongrotanaofficialchannel")}
          />
          <RowLink
            icon="globe-outline"
            title="Website"
            subtitle="https://kongrotanaofficial.github.io/"
            onPress={() => open("https://kongrotanaofficial.github.io/")}
          />
        </Card>

        {/* Contact */}
        <Card>
          <Text style={s.sectionTitle}>Contact</Text>
          <RowLink
            icon="mail-outline"
            title="Email"
            subtitle="kongrotanaofficial@gmail.com"
            onPress={() => open("mailto:kongrotanaofficial@gmail.com")}
          />
          <RowLink
            icon="call-outline"
            title="Phone"
            subtitle="+855 10 246 083"
            onPress={() => open("tel:+85510246083")}
          />
          <RowLink
            icon="location-outline"
            title="Address"
            subtitle="Your office location"
            onPress={() => Alert.alert("Address", "Update this with your real address")}
          />
        </Card>

        {/* Logout — with confirmation dialog */}
        <PrimaryButton
          title="Logout"
          icon="log-out-outline"
          variant="danger"
          onPress={onLogout}
        />
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  sectionTitle: { fontWeight: "900", fontSize: 16, color: theme.colors.text, marginBottom: 10 },
  p:            { color: theme.colors.sub, lineHeight: 20 },
  row:          { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  rowIcon: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: theme.colors.muted, borderWidth: 1, borderColor: theme.colors.border,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  rowTitle: { fontWeight: "900", color: theme.colors.text },
  rowSub:   { marginTop: 2, color: theme.colors.sub },
  pillRow:  { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: theme.colors.muted, borderWidth: 1, borderColor: theme.colors.border,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
  },
  pillText: { color: theme.colors.sub, fontWeight: "800" },
});