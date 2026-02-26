import React, { useState } from "react";
import { View, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { updateMember, Member } from "../db/db";
import { Screen, Hero, Card, TextField, PrimaryButton } from "../ui/ui";

export default function EditMemberScreen() {
  const nav   = useNavigation<any>();
  const route = useRoute<any>();
  const member: Member = route.params.member;

  const [name,  setName]  = useState(member.name);
  const [phone, setPhone] = useState(member.phone);

  const onSave = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Invalid", "Please enter name and phone");
      return;
    }
    try {
      updateMember(member.id, name.trim(), phone.trim());
      nav.goBack();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <Screen>
      <Hero
        title="Edit Member" subtitle="Update member details"
        icon="create-outline" leftIcon="chevron-back" onLeftPress={() => nav.goBack()}
      />
      <View style={{ padding: 16 }}>
        <Card>
          <TextField label="Name"  value={name}  onChangeText={setName}  icon="person-outline" placeholder="Member name" />
          <TextField label="Phone" value={phone} onChangeText={setPhone} icon="call-outline"   placeholder="Phone number" keyboardType="phone-pad" />
          <PrimaryButton title="Save Changes" icon="save-outline" onPress={onSave} />
        </Card>
      </View>
    </Screen>
  );
}