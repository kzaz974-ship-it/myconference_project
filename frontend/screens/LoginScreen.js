import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Remplis email et mot de passe");
      return;
    }

    Alert.alert("Login", "Bouton cliqué ✅");
  };

  return (
    <View style={{ padding: 20, marginTop: 80 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        EasyChair Login
      </Text>

      <Text>Email</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 15, padding: 8 }}
        onChangeText={setEmail}
      />

      <Text>Password</Text>
      <TextInput
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 20, padding: 8 }}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
