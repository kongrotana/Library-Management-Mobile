import React, { useEffect, useMemo, useState } from "react";
import { View, Alert, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getBooks, getMembers, issueLoan, Book, Member } from "../db/db";
import { Screen, Hero, Card, Dropdown, DatePickerField, PrimaryButton } from "../ui/ui";

export default function IssueLoanScreen() {
  const nav = useNavigation<any>();
  const [books,    setBooks]    = useState<Book[]>([]);
  const [members,  setMembers]  = useState<Member[]>([]);
  const [bookId,   setBookId]   = useState<number | null>(null);
  const [memberId, setMemberId] = useState<number | null>(null);
  const [dueDate,  setDueDate]  = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d;
  });

  useEffect(() => {
    setBooks(getBooks());
    setMembers(getMembers());
  }, []);

  const bookOptions = useMemo(() =>
    books.map((b) => ({
      label: `${b.title} — ${b.author} (Qty: ${b.qty})`,
      value: b.id,
    })),
    [books]
  );

  const memberOptions = useMemo(() =>
    members.map((m) => ({ label: `${m.name} — ${m.phone}`, value: m.id })),
    [members]
  );

  const onSave = () => {
    if (!bookId || !memberId) {
      Alert.alert("Invalid", "Please select a book and a member");
      return;
    }
    try {
      issueLoan(bookId, memberId, dueDate.toISOString());
      nav.goBack();
    } catch (e: any) {
      Alert.alert("Cannot Issue Loan", e.message);
    }
  };

  return (
    <Screen>
      <Hero
        title="Issue Loan" subtitle="Assign a book to a member"
        icon="receipt-outline" leftIcon="chevron-back" onLeftPress={() => nav.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        <Card>
          <Dropdown
            label="Select Book"
            value={bookId}
            options={bookOptions}
            onSelect={(v) => setBookId(Number(v))}
            placeholder="Choose a book..."
            icon="book-outline"
          />
          <Dropdown
            label="Select Member"
            value={memberId}
            options={memberOptions}
            onSelect={(v) => setMemberId(Number(v))}
            placeholder="Choose a member..."
            icon="person-outline"
          />
          <DatePickerField
            label="Due Date"
            value={dueDate}
            onChange={setDueDate}
          />
          <PrimaryButton title="Issue Loan" icon="checkmark-circle-outline" onPress={onSave} />
        </Card>
      </ScrollView>
    </Screen>
  );
}