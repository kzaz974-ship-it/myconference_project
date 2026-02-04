import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_URL = "http://192.168.1.146/myconference_api";

export default function CreateConference() {
  const router = useRouter();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!titre.trim()) return Alert.alert("Erreur", "Title is required");
    setLoading(true);

    const saved = await AsyncStorage.getItem("user");
    if (!saved) { setLoading(false); return router.replace("/login"); }
    const u = JSON.parse(saved);

    try {
      const res = await fetch(`${API_URL}/api/chair_create_conference.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: u.id_user,
          titre,
          description,
          date_debut: dateDebut || null,
          date_fin: dateFin || null,
        }),
      });

      const data = await res.json();
      if (!data.success) return Alert.alert("Erreur", data.message || "Failed");

      Alert.alert("✅ Success", "Conference created");
      router.back();
    } catch (e) {
      Alert.alert("Erreur", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Conference</Text>

      <TextInput style={styles.input} placeholder="Title" value={titre} onChangeText={setTitre} />
      <TextInput style={[styles.input, { height: 90 }]} multiline placeholder="Description" value={description} onChangeText={setDescription} />
      <TextInput style={styles.input} placeholder="Start date (YYYY-MM-DD)" value={dateDebut} onChangeText={setDateDebut} />
      <TextInput style={styles.input} placeholder="End date (YYYY-MM-DD)" value={dateFin} onChangeText={setDateFin} />

      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Saving..." : "Create"}</Text>
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
