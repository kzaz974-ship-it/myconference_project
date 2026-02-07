import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_URL } from "@/constants/api";

type User = { id_user: number; role: "author" | "reviewer" | "chair"; prenom?: string };

type AssignmentItem = {
  id_article: number;
  titre: string;
  statut?: string;
  id_conf?: number;
  date_soumission?: string;
};

export default function ReviewerHome() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const saved = await AsyncStorage.getItem("user");
      if (!saved) return router.replace("/login" as any);

      const u = JSON.parse(saved) as User;
      setUser(u);

      if (u.role !== "reviewer") {
        Alert.alert("Access denied", "Reviewer only");
        return router.replace("/dashboard" as any);
      }

      const res = await fetch(`${API_URL}/api/reviewer_assignments.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id_user }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert("Erreur", data.message || "Failed");
        setItems([]);
        return;
      }

      setItems(data.articles || data.assignments || []);
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <Text style={styles.title}>🧑‍⚖️ Reviewer Dashboard</Text>
        <TouchableOpacity style={styles.btn} onPress={load}>
          <Text style={styles.btnText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.muted}>Loading...</Text>
      ) : items.length === 0 ? (
        <Text style={styles.muted}>No assigned articles yet.</Text>
      ) : (
        items.map((a) => (
          <View key={a.id_article} style={styles.card}>
            <Text style={styles.cardTitle}>{a.titre}</Text>
            <Text style={styles.muted}>Status: {a.statut || "—"}</Text>

            <TouchableOpacity
              style={[styles.btn, { marginTop: 10 }]}
              onPress={() => router.push(`/reviewer/review/${a.id_article}` as any)}
            >
              <Text style={styles.btnText}>✍️ Write Review</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "900" },
  muted: { color: "#666", marginTop: 10 },

  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#eee", marginTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: "900" },

  btn: { backgroundColor: "#111", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "800", textAlign: "center" },
});
