import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_URL } from "@/constants/api"; // ✅ بدل هادي

type User = { id_user: number; role: "author" | "reviewer" | "chair" };

export default function CreateReviewer() {
  const router = useRouter();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!prenom.trim() || !nom.trim() || !email.trim() || !country.trim() || !password) {
      return Alert.alert("Erreur", "Please fill all required fields");
    }

    setLoading(true);
    try {
      const saved = await AsyncStorage.getItem("user");
      if (!saved) return router.replace("/login" as any);

      const u = JSON.parse(saved) as User;
      if (u.role !== "chair") {
        Alert.alert("Access denied", "Organizer only");
        return router.replace("/dashboard" as any);
      }

      const res = await fetch(`${API_URL}/api/chair_create_reviewer.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: u.id_user,
          nom,
          prenom,
          email,
          password,
          affiliation,
          country,
        }),
      });

      const data = await res.json();
      if (!data.success) return Alert.alert("Erreur", data.message || "Failed");

      Alert.alert("✅ Success", "Reviewer created");
      router.replace("/chair" as any);
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>➕ Add Reviewer</Text>

      <TextInput style={styles.input} placeholder="First name *" value={prenom} onChangeText={setPrenom} />
      <TextInput style={styles.input} placeholder="Last name *" value={nom} onChangeText={setNom} />
      <TextInput style={styles.input} placeholder="Email *" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Affiliation" value={affiliation} onChangeText={setAffiliation} />
      <TextInput style={styles.input} placeholder="Country *" value={country} onChangeText={setCountry} />
      <TextInput style={styles.input} placeholder="Password *" value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Saving..." : "Create Reviewer"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f7fa" },
  title: { fontSize: 22, fontWeight: "900", marginBottom: 12 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 12, marginTop: 10 },
  btn: { backgroundColor: "#111", padding: 14, borderRadius: 12, marginTop: 14 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "900" },
});
