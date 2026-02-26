import React, { useCallback, useState } from "react";
import {
  View, Text, FlatList, Alert, Modal,
  StyleSheet, TouchableOpacity, ScrollView,
} from "react-native";
import { useFocusEffect, useNavigation, DrawerActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  getActiveLoans, getLoanHistory, returnLoan,
  getStaffList, LoanRow, Staff,
} from "../db/db";
import {
  Screen, Hero, Card, FAB, PrimaryButton,
  Dropdown, DatePickerField,
} from "../ui/ui";
import { theme } from "../ui/theme";

// ─── Return Modal ─────────────────────────────────────────────────────────────
function ReturnModal({
  loan, staffList, onConfirm, onClose,
}: {
  loan: LoanRow;
  staffList: Staff[];
  onConfirm: (returnedAt: string, receivedBy: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [staffId,    setStaffId]    = useState<number | null>(null);

  const staffOptions = staffList.map((s) => ({
    label: `${s.username} (${s.role})`,
    value: s.id,
  }));

  const onSubmit = () => {
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff) {
      Alert.alert("Invalid", "Please select the staff member receiving the book");
      return;
    }
    onConfirm(returnDate.toISOString(), staff.username);
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={ms.overlay}>
        <View style={[ms.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={ms.handle} />
          <Text style={ms.title}>Return Book</Text>
          <Text style={ms.bookName}>{loan.book_title}</Text>
          <Text style={ms.sub}>Borrowed by: {loan.member_name}</Text>
          <DatePickerField label="Return Date" value={returnDate} onChange={setReturnDate} />
          <Dropdown
            label="Received By (Staff)"
            value={staffId}
            options={staffOptions}
            onSelect={(v) => setStaffId(Number(v))}
            placeholder="Select staff..."
            icon="person-outline"
          />
          <PrimaryButton title="Confirm Return" icon="checkmark-circle-outline" onPress={onSubmit} />
          <PrimaryButton title="Cancel" icon="close-outline" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

// ─── History Modal ────────────────────────────────────────────────────────────
function HistoryModal({ onClose }: { onClose: () => void }) {
  const insets  = useSafeAreaInsets();
  const history = getLoanHistory();

  const wasLate = (due: string, returned: string) =>
    new Date(returned) > new Date(due);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={hs.overlay}>
        <View style={[hs.sheet, { paddingBottom: insets.bottom + 8 }]}>
          {/* Header */}
          <View style={hs.handle} />
          <View style={hs.header}>
            <View style={hs.headerLeft}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
              <Text style={hs.headerTitle}>Loan History</Text>
            </View>
            <View style={hs.countBadge}>
              <Text style={hs.countText}>{history.length} records</Text>
            </View>
          </View>

          {/* Stats row */}
          {history.length > 0 && (
            <View style={hs.statsRow}>
              <View style={[hs.statBox, { borderColor: "#22C55E33", backgroundColor: "#22C55E0d" }]}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#22C55E" />
                <Text style={[hs.statVal, { color: "#22C55E" }]}>
                  {history.filter(h => !wasLate(h.due_date, h.returned_at!)).length}
                </Text>
                <Text style={[hs.statLbl, { color: "#22C55E99" }]}>On Time</Text>
              </View>
              <View style={[hs.statBox, { borderColor: theme.colors.danger + "33", backgroundColor: theme.colors.danger + "0d" }]}>
                <Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} />
                <Text style={[hs.statVal, { color: theme.colors.danger }]}>
                  {history.filter(h => wasLate(h.due_date, h.returned_at!)).length}
                </Text>
                <Text style={[hs.statLbl, { color: theme.colors.danger + "99" }]}>Late</Text>
              </View>
              <View style={[hs.statBox, { borderColor: theme.colors.primary + "33", backgroundColor: theme.colors.primary + "0d" }]}>
                <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
                <Text style={[hs.statVal, { color: theme.colors.primary }]}>{history.length}</Text>
                <Text style={[hs.statLbl, { color: theme.colors.primary + "99" }]}>Total</Text>
              </View>
            </View>
          )}

          {/* List */}
          <FlatList
            data={history}
            keyExtractor={(i) => String(i.id)}
            style={{ maxHeight: 420 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={hs.emptyWrap}>
                <Ionicons name="document-outline" size={40} color={theme.colors.sub + "55"} />
                <Text style={hs.emptyText}>No returned loans yet</Text>
              </View>
            }
            renderItem={({ item }) => {
              const late = wasLate(item.due_date, item.returned_at!);
              return (
                <View style={[hs.row, late && hs.rowLate]}>
                  {/* Status dot */}
                  <View style={[hs.dot, { backgroundColor: late ? theme.colors.danger : "#22C55E" }]} />

                  {/* Info */}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={hs.rowTitle} numberOfLines={1}>{item.book_title}</Text>
                    <Text style={hs.rowSub}>{item.member_name}</Text>
                    <View style={hs.dateRow}>
                      <Ionicons name="calendar-outline" size={11} color={theme.colors.sub} />
                      <Text style={hs.dateText}>
                        Returned: {new Date(item.returned_at!).toLocaleDateString()}
                      </Text>
                      {item.received_by && (
                        <>
                          <Text style={hs.dateSep}>·</Text>
                          <Ionicons name="person-outline" size={11} color={theme.colors.sub} />
                          <Text style={hs.dateText}>{item.received_by}</Text>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Late / On time badge */}
                  <View style={[hs.badge, late ? hs.badgeLate : hs.badgeOk]}>
                    <Text style={[hs.badgeText, { color: late ? theme.colors.danger : "#22C55E" }]}>
                      {late ? "Late" : "OK"}
                    </Text>
                  </View>
                </View>
              );
            }}
          />

          {/* Close */}
          <TouchableOpacity style={hs.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close-outline" size={18} color={theme.colors.sub} />
            <Text style={hs.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function LoansScreen() {
  const nav = useNavigation<any>();
  const [loans,       setLoans]       = useState<LoanRow[]>([]);
  const [staffList,   setStaffList]   = useState<Staff[]>([]);
  const [selected,    setSelected]    = useState<LoanRow | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const load = useCallback(() => {
    setLoans(getActiveLoans());
    setStaffList(getStaffList());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onReturn = (returnedAt: string, receivedBy: string) => {
    if (!selected) return;
    try {
      returnLoan(selected.id, returnedAt, receivedBy);
      setSelected(null);
      load();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const isOverdue = (due: string) => new Date(due) < new Date();

  return (
    <Screen>
      <Hero
        title="Loans"
        subtitle={`Active: ${loans.length}`}
        icon="time-outline"
        leftIcon="menu-outline"
        onLeftPress={() => nav.dispatch(DrawerActions.openDrawer())}
        // ── Report icon on the right ──
        rightIcon="document-text-outline"
        onRightPress={() => setShowHistory(true)}
      />

      <View style={{ flex: 1, padding: 16 }}>
        <FlatList
          data={loans}
          keyExtractor={(i) => String(i.id)}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const overdue = isOverdue(item.due_date);
            return (
              <Card style={s.card}>
                <View style={{ flex: 1 }}>
                  <Text style={s.title}>{item.book_title}</Text>
                  <Text style={s.sub}>To: {item.member_name}</Text>
                  <View style={s.dateRow}>
                    <View style={[s.badge, overdue && s.badgeDanger]}>
                      <Text style={[s.badgeText, overdue && { color: theme.colors.danger }]}>
                        {overdue ? "⚠ Overdue" : "Due"}: {new Date(item.due_date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
                <PrimaryButton
                  title="Return"
                  icon="arrow-undo-outline"
                  variant="warning"
                  onPress={() => setSelected(item)}
                />
              </Card>
            );
          }}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Ionicons name="time-outline" size={44} color={theme.colors.sub + "55"} />
              <Text style={s.empty}>No active loans.</Text>
              <Text style={s.emptySub}>Tap + to issue a loan</Text>
            </View>
          }
        />
      </View>

      <FAB icon="add" onPress={() => nav.navigate("IssueLoan")} />

      {/* Return modal */}
      {selected && (
        <ReturnModal
          loan={selected}
          staffList={staffList}
          onConfirm={onReturn}
          onClose={() => setSelected(null)}
        />
      )}

      {/* History / Report modal */}
      {showHistory && (
        <HistoryModal onClose={() => setShowHistory(false)} />
      )}
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  card:        { flexDirection: "row", alignItems: "center" },
  title:       { fontSize: 15, fontWeight: "900", color: theme.colors.text },
  sub:         { marginTop: 2, color: theme.colors.sub, fontSize: 13 },
  dateRow:     { flexDirection: "row", marginTop: 6 },
  badge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: theme.colors.muted, borderWidth: 1, borderColor: theme.colors.border },
  badgeDanger: { backgroundColor: "#FEF2F2", borderColor: theme.colors.danger + "44" },
  badgeText:   { fontSize: 12, fontWeight: "800", color: theme.colors.sub },
  emptyWrap:   { alignItems: "center", marginTop: 60, gap: 6 },
  empty:       { fontSize: 15, fontWeight: "700", color: theme.colors.sub },
  emptySub:    { fontSize: 13, color: theme.colors.sub + "88" },
});

const ms = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet:    { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  handle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 12 },
  title:    { fontSize: 18, fontWeight: "900", color: theme.colors.text, marginBottom: 4 },
  bookName: { fontSize: 15, fontWeight: "800", color: theme.colors.primary, marginBottom: 2 },
  sub:      { color: theme.colors.sub, marginBottom: 8 },
});

const hs = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet:   { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 0 },
  handle:  { width: 36, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", alignSelf: "center", marginTop: 10, marginBottom: 4 },

  // Header
  header:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle:{ fontSize: 16, fontWeight: "900", color: theme.colors.text },
  countBadge: { backgroundColor: theme.colors.primary + "15", borderWidth: 1, borderColor: theme.colors.primary + "33", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  countText:  { fontSize: 12, fontWeight: "700", color: theme.colors.primary },

  // Stats
  statsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  statBox:  { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 2 },
  statVal:  { fontSize: 16, fontWeight: "900" },
  statLbl:  { fontSize: 10, fontWeight: "600" },

  // Row
  row:     { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.border },
  rowLate: { borderColor: theme.colors.danger + "33", backgroundColor: "#FEF2F2" },
  dot:     { width: 8, height: 8, borderRadius: 4, marginTop: 2 },
  rowTitle:{ fontSize: 14, fontWeight: "800", color: theme.colors.text },
  rowSub:  { fontSize: 12, color: theme.colors.sub, marginTop: 1 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  dateText:{ fontSize: 11, color: theme.colors.sub },
  dateSep: { fontSize: 11, color: theme.colors.sub },

  // Badge
  badge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1, marginLeft: 8 },
  badgeOk:   { backgroundColor: "#F0FDF4", borderColor: "#22C55E33" },
  badgeLate: { backgroundColor: "#FEF2F2", borderColor: theme.colors.danger + "33" },
  badgeText: { fontSize: 11, fontWeight: "800" },

  // Empty
  emptyWrap: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 14, color: theme.colors.sub, fontWeight: "600" },

  // Close
  closeBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginHorizontal: 16, marginTop: 8, marginBottom: 4, paddingVertical: 13, borderRadius: 14, backgroundColor: theme.colors.muted, borderWidth: 1, borderColor: theme.colors.border },
  closeBtnText: { fontSize: 14, fontWeight: "700", color: theme.colors.sub },
});