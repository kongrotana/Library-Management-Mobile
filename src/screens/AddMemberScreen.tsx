import React, { useState } from "react";
import { View, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { addMember } from "../db/db";
import { Screen, Hero, Card, TextField, PrimaryButton } from "../ui/ui";

export default function AddMemberScreen() {
  const nav = useNavigation<any>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const onSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Invalid", "Please enter name and phone");
      return;
    }
    await addMember(name.trim(), phone.trim());
    nav.goBack();
  };

  return (
    <Screen>
      <Hero
        title="Add Member"
        subtitle="Register a new member"
        icon="person-add-outline"
        leftIcon="chevron-back"
        onLeftPress={() => nav.goBack()}
      />
      <View style={{ padding: 16 }}>
        <Card>
          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            icon="person-outline"
            placeholder="Member name"
          />
          <TextField
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            icon="call-outline"
            placeholder="Phone number"
            keyboardType="phone-pad"
          />
          <PrimaryButton title="Save" icon="save-outline" onPress={onSave} />
        </Card>
      </View>
    </Screen>
  );
}