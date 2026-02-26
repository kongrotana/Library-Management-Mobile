import React, { useCallback, useMemo, useState } from "react";
import {
  View, Text, FlatList, Alert, TextInput,
  StyleSheet, Image, TouchableOpacity,
} from "react-native";
import { useFocusEffect, useNavigation, DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getBooks, deleteBook, Book } from "../db/db";
import { Screen, Hero, Card, IconButton, FAB } from "../ui/ui";
import { theme } from "../ui/theme";

export default function BooksScreen() {
  const nav = useNavigation<any>();
  const [books, setBooks] = useState<Book[]>([]);
  const [q,     setQ]     = useState("");

  const load = useCallback(() => setBooks(getBooks()), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return books;
    return books.filter(
      (b) => b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s)
    );
  }, [q, books]);

  const onDelete = (id: number) => {
    Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: () => {
          try   { deleteBook(id); load(); }
          catch (e: any) { Alert.alert("Cannot Delete", e.message); }
        },
      },
    ]);
  };

  return (
    <Screen>
      <Hero
        title="Books"
        subtitle={`Total: ${books.length}`}
        icon="book-outline"
        leftIcon="menu-outline"
        onLeftPress={() => nav.dispatch(DrawerActions.openDrawer())}
      />

      <View style={{ flex: 1, padding: 16 }}>
        {/* Search */}
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={17} color={theme.colors.sub} style={{ marginRight: 8 }} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search title or author..."
            placeholderTextColor="#94A3B8"
            style={s.search}
            clearButtonMode="while-editing"
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(i) => String(i.id)}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <Card style={s.card}>
              {/* Cover thumbnail */}
              <TouchableOpacity
                onPress={() => nav.navigate("EditBook", { book: item })}
                activeOpacity={0.85}
              >
                {item.image_uri ? (
                  <Image source={{ uri: item.image_uri }} style={s.thumb} resizeMode="cover" />
                ) : (
                  <View style={s.thumbPlaceholder}>
                    <Text style={s.thumbLetter}>{item.title.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Info */}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.title} numberOfLines={2}>{item.title}</Text>
                <Text style={s.sub} numberOfLines={1}>by {item.author}</Text>
                <View style={s.qtyRow}>
                  <View style={[s.qtyBadge, item.qty === 0 && s.qtyBadgeDanger]}>
                    <Text style={[s.qtyText, item.qty === 0 && { color: theme.colors.danger }]}>
                      Qty: {item.qty}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={s.actions}>
                <IconButton
                  icon="create-outline"
                  color={theme.colors.primary}
                  onPress={() => nav.navigate("EditBook", { book: item })}
                />
                <IconButton
                  icon="trash-outline"
                  color={theme.colors.danger}
                  onPress={() => onDelete(item.id)}
                />
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Ionicons name="book-outline" size={44} color={theme.colors.sub + "55"} />
              <Text style={s.empty}>No books yet. Tap + to add.</Text>
            </View>
          }
        />
      </View>

      <FAB icon="add" onPress={() => nav.navigate("AddBook")} />
    </Screen>
  );
}

const s = StyleSheet.create({
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  search: { flex: 1, color: theme.colors.text },

  card:    { flexDirection: "row", alignItems: "center" },
  thumb:   { width: 52, height: 70, borderRadius: 10, backgroundColor: theme.colors.muted },
  thumbPlaceholder: {
    width: 52, height: 70, borderRadius: 10,
    backgroundColor: theme.colors.primary + "22",
    alignItems: "center", justifyContent: "center",
  },
  thumbLetter: { fontSize: 22, fontWeight: "900", color: theme.colors.primary },

  title:   { fontSize: 15, fontWeight: "900", color: theme.colors.text },
  sub:     { marginTop: 2, color: theme.colors.sub, fontSize: 13 },
  qtyRow:  { flexDirection: "row", marginTop: 6 },
  qtyBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
    backgroundColor: theme.colors.muted, borderWidth: 1, borderColor: theme.colors.border,
  },
  qtyBadgeDanger: { backgroundColor: "#FEF2F2", borderColor: theme.colors.danger + "44" },
  qtyText: { fontSize: 12, fontWeight: "800", color: theme.colors.sub },
  actions: { flexDirection: "row", gap: 6, marginLeft: 8 },

  emptyWrap: { alignItems: "center", marginTop: 60, gap: 8 },
  empty:     { textAlign: "center", color: theme.colors.sub, fontSize: 14 },
});