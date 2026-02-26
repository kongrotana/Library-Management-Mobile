import React, { useCallback, useMemo, useState } from "react";
import {
  View, Text, TextInput, FlatList, StyleSheet,
  Modal, Image, TouchableOpacity, ScrollView, Pressable,
} from "react-native";
import { useFocusEffect, useNavigation, DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBooks, Book } from "../db/db";
import { Screen, Hero, Card } from "../ui/ui";
import { theme } from "../ui/theme";

// ─── Book Detail Modal ────────────────────────────────────────────────────────
function BookDetailModal({
  book,
  onClose,
}: {
  book: Book;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={ms.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[ms.sheet, { paddingBottom: insets.bottom + 24 }]}>
          {/* Handle */}
          <View style={ms.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Cover image */}
            <View style={ms.coverWrap}>
              {book.image_uri ? (
                <Image
                  source={{ uri: book.image_uri }}
                  style={ms.coverImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={ms.coverPlaceholder}>
                  <Text style={ms.coverLetter}>{book.title.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>

            {/* Details */}
            <View style={ms.body}>
              <Text style={ms.bookTitle}>{book.title}</Text>
              <Text style={ms.bookAuthor}>by {book.author}</Text>

              {/* Stats row */}
              <View style={ms.statsRow}>
                <View style={[ms.statBox, { borderColor: theme.colors.primary + "33", backgroundColor: theme.colors.primary + "0d" }]}>
                  <Ionicons name="layers-outline" size={18} color={theme.colors.primary} />
                  <Text style={[ms.statValue, { color: theme.colors.primary }]}>{book.qty}</Text>
                  <Text style={[ms.statLabel, { color: theme.colors.primary + "99" }]}>Available</Text>
                </View>
                <View style={[ms.statBox, {
                  borderColor: book.qty > 0
                    ? "#22C55E33" : theme.colors.danger + "33",
                  backgroundColor: book.qty > 0
                    ? "#22C55E0d" : theme.colors.danger + "0d",
                }]}>
                  <Ionicons
                    name={book.qty > 0 ? "checkmark-circle-outline" : "close-circle-outline"}
                    size={18}
                    color={book.qty > 0 ? "#22C55E" : theme.colors.danger}
                  />
                  <Text style={[ms.statValue, { color: book.qty > 0 ? "#22C55E" : theme.colors.danger }]}>
                    {book.qty > 0 ? "Yes" : "No"}
                  </Text>
                  <Text style={[ms.statLabel, { color: book.qty > 0 ? "#22C55E99" : theme.colors.danger + "99" }]}>
                    In Stock
                  </Text>
                </View>
                <View style={[ms.statBox, { borderColor: theme.colors.border, backgroundColor: theme.colors.muted }]}>
                  <Ionicons name="barcode-outline" size={18} color={theme.colors.sub} />
                  <Text style={[ms.statValue, { color: theme.colors.text }]}>#{book.id}</Text>
                  <Text style={[ms.statLabel, { color: theme.colors.sub }]}>Book ID</Text>
                </View>
              </View>

              {/* Status banner */}
              {book.qty === 0 && (
                <View style={ms.outBanner}>
                  <Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} />
                  <Text style={ms.outText}>All copies are currently on loan</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Close button */}
          <TouchableOpacity style={ms.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close-outline" size={20} color={theme.colors.sub} />
            <Text style={ms.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Browse Screen ────────────────────────────────────────────────────────────
export default function BrowseBooksScreen() {
  const nav = useNavigation<any>();
  const [q,          setQ]          = useState("");
  const [books,      setBooks]      = useState<Book[]>([]);
  const [selected,   setSelected]   = useState<Book | null>(null);

  const load = useCallback(() => setBooks(getBooks()), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(s) ||
        b.author.toLowerCase().includes(s) ||
        String(b.id).includes(s)
    );
  }, [q, books]);

  return (
    <Screen>
      <Hero
        title="Browse"
        subtitle="Search available books"
        icon="search-outline"
        leftIcon="menu-outline"
        onLeftPress={() => nav.dispatch(DrawerActions.openDrawer())}
      />

      <View style={{ flex: 1, padding: 16 }}>
        {/* Search bar */}
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={18} color={theme.colors.sub} style={{ marginRight: 8 }} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search title / author / id..."
            placeholderTextColor="#94A3B8"
            style={s.search}
            clearButtonMode="while-editing"
          />
        </View>

        <Text style={s.count}>Found: {filtered.length}</Text>

        <FlatList
          data={filtered}
          keyExtractor={(i) => String(i.id)}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.8} onPress={() => setSelected(item)}>
              <Card style={s.card}>
                {/* Thumbnail */}
                {item.image_uri ? (
                  <Image source={{ uri: item.image_uri }} style={s.thumb} resizeMode="cover" />
                ) : (
                  <View style={s.thumbPlaceholder}>
                    <Ionicons name="book-outline" size={20} color={theme.colors.sub} />
                  </View>
                )}

                {/* Info */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.title} numberOfLines={2}>{item.title}</Text>
                  <Text style={s.sub} numberOfLines={1}>{item.author}</Text>
                </View>

                {/* Qty + chevron */}
                <View style={s.right}>
                  <View style={[s.qtyPill, item.qty === 0 && s.qtyPillDanger]}>
                    <Text style={[s.qtyText, item.qty === 0 && { color: theme.colors.danger }]}>
                      {item.qty > 0 ? `Qty ${item.qty}` : "Out"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.sub} style={{ marginTop: 4 }} />
                </View>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Ionicons name="search-outline" size={44} color={theme.colors.sub + "55"} />
              <Text style={s.empty}>
                {q ? `No results for "${q}"` : "No books yet. Add books in Books tab."}
              </Text>
            </View>
          }
        />
      </View>

      {/* Book detail modal */}
      {selected && (
        <BookDetailModal
          book={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius, paddingHorizontal: 12, paddingVertical: 10,
  },
  search:   { flex: 1, color: theme.colors.text },
  count:    { marginTop: 10, marginBottom: 12, color: theme.colors.sub, fontWeight: "700" },

  card:     { flexDirection: "row", alignItems: "center" },
  thumb:    { width: 48, height: 64, borderRadius: 8, backgroundColor: theme.colors.muted },
  thumbPlaceholder: {
    width: 48, height: 64, borderRadius: 8,
    backgroundColor: theme.colors.muted, borderWidth: 1, borderColor: theme.colors.border,
    alignItems: "center", justifyContent: "center",
  },
  title:    { fontSize: 15, fontWeight: "900", color: theme.colors.text },
  sub:      { marginTop: 4, color: theme.colors.sub, fontSize: 13 },
  right:    { alignItems: "flex-end", gap: 4, marginLeft: 8 },
  qtyPill:  {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
    backgroundColor: theme.colors.muted, borderWidth: 1, borderColor: theme.colors.border,
  },
  qtyPillDanger: { backgroundColor: "#FEF2F2", borderColor: theme.colors.danger + "44" },
  qtyText:  { fontWeight: "800", color: theme.colors.text, fontSize: 12 },
  emptyWrap:{ alignItems: "center", marginTop: 60, gap: 8 },
  empty:    { textAlign: "center", color: theme.colors.sub, fontSize: 14 },
});

const ms = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center", marginTop: 10, marginBottom: 4,
  },

  // Cover
  coverWrap: { alignItems: "center", paddingTop: 16, paddingBottom: 8 },
  coverImage: {
    width: 130, height: 175,
    borderRadius: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 12,
    elevation: 8,
  },
  coverPlaceholder: {
    width: 130, height: 175, borderRadius: 14,
    backgroundColor: theme.colors.primary + "18",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: theme.colors.primary + "22",
  },
  coverLetter: { fontSize: 52, fontWeight: "900", color: theme.colors.primary },

  // Body
  body:       { paddingHorizontal: 20, paddingBottom: 8 },
  bookTitle:  { fontSize: 20, fontWeight: "900", color: theme.colors.text, textAlign: "center", marginBottom: 4 },
  bookAuthor: { fontSize: 14, color: theme.colors.sub, textAlign: "center", marginBottom: 20, fontWeight: "600" },

  // Stats
  statsRow:  { flexDirection: "row", gap: 10, marginBottom: 16 },
  statBox:   {
    flex: 1, alignItems: "center", paddingVertical: 12,
    borderRadius: 14, borderWidth: 1, gap: 4,
  },
  statValue: { fontSize: 16, fontWeight: "900" },
  statLabel: { fontSize: 11, fontWeight: "600" },

  // Out of stock banner
  outBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: theme.colors.danger + "33",
    borderRadius: 12, padding: 12, marginBottom: 8,
  },
  outText: { fontSize: 13, color: theme.colors.danger, fontWeight: "700", flex: 1 },

  // Close button
  closeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, marginHorizontal: 20, marginTop: 8,
    paddingVertical: 13, borderRadius: 14,
    backgroundColor: theme.colors.muted,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  closeBtnText: { fontSize: 14, fontWeight: "700", color: theme.colors.sub },
});