import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_URL } from "@/constants/api";

type Article = {
  id_article: number;
  titre: string;
  statut?: string;
  date_soumission?: string;
  id_conf?: number;
};

export default function MyArticles() {
  const router = useRouter();
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const saved = await AsyncStorage.getItem("user");
      if (!saved) return router.replace("/login" as any);
      const u = JSON.parse(saved);

      const res = await fetch(`${API_URL}/api/my_articles.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id_user }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert("Erreur", data.message || "Failed");
        return;
      }

      setItems(data.articles || []);
    } catch (e) {
      Alert.alert("Erreur", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📄 My Submissions</Text>
        <TouchableOpacity style={styles.btn} onPress={load}>
          <Text style={styles.btnText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.btn, { backgroundColor: "#f4b400" }]} onPress={() => router.push("/articles/create" as any)}>
        <Text style={[styles.btnText, { color: "#111" }]}>➕ Create New Article</Text>
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.muted}>Loading...</Text>
      ) : items.length === 0 ? (
        <Text style={styles.muted}>No submissions yet.</Text>
      ) : (
        items.map((a) => (
          <View key={a.id_article} style={styles.card}>
            <Text style={styles.cardTitle}>{a.titre}</Text>
            <Text style={styles.muted}>Status: {a.statut || "submitted"}</Text>
            {!!a.date_soumission && <Text style={styles.muted}>Date: {a.date_soumission}</Text>}
          </View>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "900" },
  muted: { color: "#666", marginTop: 10 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#eee", marginTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: "900" },
  btn: { backgroundColor: "#111", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "800", textAlign: "center" },
});
