import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Animated, Easing,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/auth";
import { theme } from "../ui/theme";

// ─── Shimmer block ────────────────────────────────────────────────────────────
function Shimmer({ width, height, borderRadius = 8, style }: {
  width: number | string; height: number; borderRadius?: number; style?: any;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.45] });
  return (
    <Animated.View style={[{ width, height, borderRadius, backgroundColor: "rgba(255,255,255,0.4)", opacity }, style]} />
  );
}

// ─── Pulse dot ────────────────────────────────────────────────────────────────
function PulseDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.25)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1,    duration: 380, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.25, duration: 380, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[sk.dot, { opacity: anim }]} />;
}

// ─── Facebook-style skeleton ──────────────────────────────────────────────────
function Skeleton() {
  return (
    <LinearGradient colors={["#0F172A", "#1E293B", "#0F172A"]} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView style={sk.safe} edges={["top", "left", "right"]}>
        {/* Brand placeholder */}
        <View style={sk.brandWrap}>
          <Shimmer width={68} height={68} borderRadius={20} />
          <Shimmer width={200} height={20} borderRadius={6} style={{ marginTop: 18 }} />
          <Shimmer width={130} height={13} borderRadius={4} style={{ marginTop: 8 }} />
        </View>

        {/* Card placeholder */}
        <View style={sk.card}>
          <Shimmer width={72}   height={11} borderRadius={4} />
          <Shimmer width="100%" height={44} borderRadius={10} style={{ marginTop: 7, marginBottom: 18 }} />
          <Shimmer width={72}   height={11} borderRadius={4} />
          <Shimmer width="100%" height={44} borderRadius={10} style={{ marginTop: 7, marginBottom: 22 }} />
          <Shimmer width="100%" height={50} borderRadius={12} />
        </View>

        {/* Loading dots */}
        <View style={sk.dotsRow}>
          {[0, 160, 320].map((d) => <PulseDot key={d} delay={d} />)}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const sk = StyleSheet.create({
  safe:     { flex: 1, justifyContent: "center" },
  brandWrap:{ alignItems: "center", marginBottom: 36, paddingHorizontal: 32 },
  card:     { marginHorizontal: 20, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 18, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  dotsRow:  { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 44 },
  dot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.55)" },
});

// ─── Login screen ─────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [ready,    setReady]    = useState(false);

  // Show skeleton for ~1.8 s then fade in the form
  const fadeIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      setReady(true);
      Animated.timing(fadeIn, {
        toValue: 1, duration: 420,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return <Skeleton />;

  const onLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Required", "Please enter username and password.");
      return;
    }
    setLoading(true);
    try {
      const ok = await signIn(username.trim().toLowerCase(), password);
      if (!ok) Alert.alert("Login Failed", "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0F172A", "#1E293B", "#0F172A"]} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
          >
          <ScrollView
            contentContainerStyle={f.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity: fadeIn, width: "100%" }}>

              {/* ── Brand ── */}
              <View style={f.brand}>
                <View style={f.brandIcon}>
                  <Ionicons name="library-outline" size={30} color="#fff" />
                </View>
                <Text style={f.brandTitle}>Library Management</Text>
                <Text style={f.brandSub}>Sign in to continue</Text>
              </View>

              {/* ── Form card ── */}
              <View style={f.card}>

                {/* Username */}
                <View style={f.field}>
                  <Text style={f.label}>USERNAME</Text>
                  <View style={f.inputRow}>
                    <Ionicons name="person-outline" size={17} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
                    <TextInput
                      value={username}
                      onChangeText={(t) => setUsername(t.toLowerCase().replace(/\s/g, ""))}
                      placeholder="Enter username"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      style={f.input}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={f.field}>
                  <Text style={f.label}>PASSWORD</Text>
                  <View style={f.inputRow}>
                    <Ionicons name="lock-closed-outline" size={17} color="rgba(255,255,255,0.4)" style={{ marginRight: 10 }} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter password"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      style={[f.input, { flex: 1 }]}
                      secureTextEntry={!showPass}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowPass(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={17} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Login button */}
                <TouchableOpacity
                  style={[f.btn, loading && { opacity: 0.7 }]}
                  onPress={onLogin}
                  disabled={loading}
                  activeOpacity={0.82}
                >
                  {loading ? (
                    <View style={f.btnRow}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={f.btnText}>Signing in…</Text>
                    </View>
                  ) : (
                    <View style={f.btnRow}>
                      <Text style={f.btnText}>Sign In</Text>
                      <Ionicons name="arrow-forward-outline" size={17} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={f.version}>Library App · v1.0</Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const f = StyleSheet.create({
  scroll: { flexGrow: 1, alignItems: "center", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 48 },

  brand:      { alignItems: "center", marginBottom: 32 },
  brandIcon:  { width: 68, height: 68, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", marginBottom: 16 },
  brandTitle: { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: 0.2 },
  brandSub:   { color: "rgba(255,255,255,0.45)", fontSize: 14, marginTop: 5, fontWeight: "600" },

  card:     { width: "100%", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 20, padding: 20, paddingBottom: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  field:    { marginBottom: 16 },
  label:    { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 8 },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  input:    { flex: 1, color: "#fff", fontSize: 15, fontWeight: "600" },

  btn:    { backgroundColor: theme.colors.primary, borderRadius: 13, paddingVertical: 15, alignItems: "center", justifyContent: "center", marginTop: 4 },
  btnRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnText:{ color: "#fff", fontSize: 16, fontWeight: "900" },

  version: { color: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: "600", marginTop: 28, textAlign: "center" },
});