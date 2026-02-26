import React, { useState } from "react";
import {
  View, Alert, Image, Text, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, Pressable,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { updateBook, Book } from "../db/db";
import { Card, TextField } from "../ui/ui";
import { theme } from "../ui/theme";

// ─── Hero with Save button ────────────────────────────────────────────────────
function BookHero({
  icon, title, subtitle, onBack, onSave, canSave, hasChanges,
}: {
  icon: string; title: string; subtitle: string;
  onBack: () => void; onSave: () => void;
  canSave: boolean; hasChanges: boolean;
}) {
  return (
    <LinearGradient colors={["#111827", "#1F2937"]} style={bh.hero}>
      <StatusBar style="light" />
      <View style={bh.topRow}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [bh.backBtn, { opacity: pressed ? 0.7 : 1 }]}
          android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true }}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>

        <Pressable
          onPress={onSave}
          disabled={!canSave}
          style={({ pressed }) => [
            bh.saveBtn,
            !canSave && { opacity: 0.36 },
            pressed && canSave && { opacity: 0.72 },
          ]}
          android_ripple={canSave ? { color: "rgba(255,255,255,0.2)" } : undefined}
        >
          <Ionicons name="save-outline" size={15} color="#fff" />
          <Text style={bh.saveTxt}>Save</Text>
          {/* Yellow dot = unsaved changes */}
          {hasChanges && <View style={bh.dot} />}
        </Pressable>
      </View>

      <View style={bh.titleRow}>
        <View style={bh.iconBox}>
          <Ionicons name={icon as any} size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={bh.title}>{title}</Text>
          <Text style={bh.sub}>{subtitle}</Text>
        </View>
        {hasChanges && (
          <View style={bh.unsavedBadge}>
            <Text style={bh.unsavedTxt}>Unsaved</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const bh = StyleSheet.create({
  hero:         { padding: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  topRow:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  backBtn:      { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" },
  saveBtn:      { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: theme.colors.primary, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 13 },
  saveTxt:      { color: "#fff", fontWeight: "900", fontSize: 14 },
  dot:          { width: 7, height: 7, borderRadius: 4, backgroundColor: "#FCD34D" },
  titleRow:     { flexDirection: "row", alignItems: "center" },
  iconBox:      { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  title:        { color: "#fff", fontSize: 18, fontWeight: "900" },
  sub:          { color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 2 },
  unsavedBadge: { backgroundColor: "#F97316", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  unsavedTxt:   { color: "#fff", fontSize: 11, fontWeight: "800" },
});

// ─── Cover picker (larger, clearer crop boundary) ─────────────────────────────
function CoverPicker({
  imageUri, originalUri, onPress,
}: {
  imageUri: string | null; originalUri: string | null; onPress: () => void;
}) {
  const changed = imageUri !== originalUri;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={cp.outer}>
      <View style={[cp.frame, changed && { borderColor: theme.colors.primary + "99" }]}>
        <View style={cp.inner}>
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={cp.image} resizeMode="cover" />
              <View style={cp.overlay}>
                <View style={cp.pill}>
                  <Ionicons name="camera-outline" size={14} color="#fff" />
                  <Text style={cp.pillText}>Change Cover</Text>
                </View>
              </View>
              {/* "Changed" badge when image differs from saved */}
              {changed && (
                <View style={cp.changedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#fff" />
                  <Text style={cp.changedTxt}>Changed</Text>
                </View>
              )}
            </>
          ) : (
            <View style={cp.placeholder}>
              <View style={cp.iconCircle}>
                <Ionicons name="image-outline" size={32} color={theme.colors.primary} />
              </View>
              <Text style={cp.ph1}>Add Book Cover</Text>
              <Text style={cp.ph2}>Tap to pick photo or take camera</Text>
              <View style={cp.phBtn}>
                <Ionicons name="camera-outline" size={13} color={theme.colors.primary} />
                <Text style={cp.phBtnText}>Choose Photo</Text>
              </View>
            </View>
          )}
        </View>
      </View>
      <Text style={cp.hint}>3 : 4  ·  Portrait crop area</Text>
    </TouchableOpacity>
  );
}

const cp = StyleSheet.create({
  outer: { alignItems: "center", marginBottom: 16 },
  frame: {
    width: 190, height: 254,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    padding: 4,
  },
  inner: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: theme.colors.muted,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 6,
  },
  image:        { width: "100%", height: "100%" },
  overlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.26)", alignItems: "center", justifyContent: "flex-end", paddingBottom: 14 },
  pill:         { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  pillText:     { color: "#fff", fontWeight: "700", fontSize: 13 },
  changedBadge: { position: "absolute", top: 10, left: 10, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  changedTxt:   { color: "#fff", fontSize: 10, fontWeight: "800" },
  placeholder:  { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 16 },
  iconCircle:   { width: 58, height: 58, borderRadius: 29, backgroundColor: theme.colors.primary + "14", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.colors.primary + "30" },
  ph1:          { fontSize: 13, fontWeight: "800", color: theme.colors.text },
  ph2:          { fontSize: 11, color: theme.colors.sub, textAlign: "center", lineHeight: 16 },
  phBtn:        { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: theme.colors.primary + "12", borderWidth: 1, borderColor: theme.colors.primary + "30", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, marginTop: 2 },
  phBtnText:    { fontSize: 12, fontWeight: "700", color: theme.colors.primary },
  hint:         { fontSize: 11, color: theme.colors.sub + "99", marginTop: 10, fontWeight: "600", letterSpacing: 0.3 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function EditBookScreen() {
  const nav   = useNavigation<any>();
  const route = useRoute<any>();
  const book: Book = route.params.book;

  const [title,    setTitle]    = useState(book.title);
  const [author,   setAuthor]   = useState(book.author);
  const [qty,      setQty]      = useState(String(book.qty));
  const [imageUri, setImageUri] = useState<string | null>(book.image_uri ?? null);

  const hasChanges =
    title.trim()  !== book.title  ||
    author.trim() !== book.author ||
    Number(qty)   !== book.qty    ||
    imageUri      !== (book.image_uri ?? null);

  const canSave = hasChanges && !!title.trim() && !!author.trim() && Number(qty) >= 0;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission needed", "Please allow photo library access."); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", allowsEditing: true, aspect: [3, 4], quality: 0.8 });
    if (!r.canceled && r.assets[0]) setImageUri(r.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission needed", "Please allow camera access."); return; }
    const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [3, 4], quality: 0.8 });
    if (!r.canceled && r.assets[0]) setImageUri(r.assets[0].uri);
  };

  const onImagePress = () => {
    Alert.alert("Book Cover", "Choose an option", [
      { text: "Take Photo",          onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Remove Photo",        onPress: () => setImageUri(null), style: "destructive" },
      { text: "Cancel",              style: "cancel" },
    ]);
  };

  const onBack = () => {
    if (!hasChanges) { nav.goBack(); return; }
    Alert.alert("Discard Changes?", "You have unsaved changes that will be lost.", [
      { text: "Keep Editing", style: "cancel" },
      { text: "Discard",      style: "destructive", onPress: () => nav.goBack() },
    ]);
  };

  const onSave = () => {
    const q = Number(qty || "0");
    if (!title.trim() || !author.trim() || !Number.isFinite(q) || q < 0) {
      Alert.alert("Invalid", "Please enter Title, Author and Qty ≥ 0");
      return;
    }
    try { updateBook(book.id, title.trim(), author.trim(), q, imageUri); nav.goBack(); }
    catch (e: any) { Alert.alert("Error", e.message); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["top", "left", "right"]}>
      <BookHero
        icon="create-outline"
        title="Edit Book"
        subtitle="Update book details"
        onBack={onBack}
        onSave={onSave}
        canSave={canSave}
        hasChanges={hasChanges}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <CoverPicker
            imageUri={imageUri}
            originalUri={book.image_uri ?? null}
            onPress={onImagePress}
          />
          <Card>
            <TextField label="Title"    value={title}  onChangeText={setTitle}  icon="book-outline"   placeholder="Book title" />
            <TextField label="Author"   value={author} onChangeText={setAuthor} icon="create-outline" placeholder="Author name" />
            <TextField label="Quantity" value={qty}    onChangeText={setQty}    icon="layers-outline" keyboardType="number-pad" />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}