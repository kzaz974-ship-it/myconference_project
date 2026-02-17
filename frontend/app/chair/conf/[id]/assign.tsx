import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { API_URL } from "@/constants/api";

type User = { id_user: number; role: "author" | "reviewer" | "chair" };

type Article = {
  id_article: number;
  titre: string;
  statut: string;
};

type Reviewer = {
  id_user: number;
  prenom: string;
  nom: string;
  email: string;
};

export default function AssignReviewers() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const confId = Number(id);

  const [articles, setArticles] = useState<Article[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const saved = await AsyncStorage.getItem("user");
      if (!saved) return;

      const u = JSON.parse(saved) as User;
      if (u.role !== "chair") {
        Alert.alert("Access denied", "Organizer only");
        return;
      }

      const aRes = await fetch(`${API_URL}/api/chair_articles_by_conf.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confId }),
      });
      const aData = await aRes.json();
      setArticles(aData.success ? (aData.articles || []) : []);

      const rRes = await fetch(`${API_URL}/api/chair_reviewers_list.php`);
      const rData = await rRes.json();
      setReviewers(rData.success ? (rData.reviewers || []) : []);
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const canAssign = (statut: string) => {
    // allow assign until final decision
    return !(statut === "accepte" || statut === "rejete");
  };

  const assign = async (id_article: number, id_reviewer: number) => {
    try {
      const saved = await AsyncStorage.getItem("user");
      if (!saved) return;

      const u = JSON.parse(saved) as User;

      const res = await fetch(`${API_URL}/api/chair_assign_reviewer.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id_user, id_article, id_reviewer }),
      });

      const data = await res.json();

      if (!data.success) {
        Alert.alert("Erreur", data.message || "Assign failed");
        return;
      }

      Alert.alert("✅ Done", data.message || "Reviewer assigned");
      load();
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    }
  };

  useEffect(() => {
    if (confId > 0) load();
  }, [confId]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <Text style={styles.title}>👩‍⚖️ Assign Reviewers</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={load}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sub}>Conference ID: {confId}</Text>

      {loading ? (
        <Text style={styles.muted}>Loading...</Text>
      ) : articles.length === 0 ? (
        <Text style={styles.muted}>No submissions for this conference.</Text>
      ) : reviewers.length === 0 ? (
        <Text style={styles.muted}>No reviewers found. Create reviewers first.</Text>
      ) : (
        articles.map((a) => (
          <View key={a.id_article} style={styles.card}>
            <Text style={styles.cardTitle}>{a.titre}</Text>
            <Text style={styles.muted}>Status: {a.statut}</Text>

            {!canAssign(a.statut) ? (
              <Text style={{ marginTop: 10, color: "crimson", fontWeight: "900" }}>
                ❌ Final decision already made. Assignment disabled.
              </Text>
            ) : (
              <>
                <Text style={styles.smallTitle}>Pick a reviewer:</Text>
                {reviewers.map((r) => (
                  <TouchableOpacity
                    key={r.id_user}
                    style={styles.choice}
                    onPress={() => assign(a.id_article, r.id_user)}
                  >
                    <Text style={styles.choiceText}>
                      {r.prenom} {r.nom} — {r.email}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "900" },
  sub: { color: "#666", marginTop: 6, marginBottom: 12 },
  muted: { color: "#666", marginTop: 10 },
  refreshBtn: { backgroundColor: "#111", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  refreshText: { color: "#fff", fontWeight: "900" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#eee", marginTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#111" },
  smallTitle: { marginTop: 12, fontWeight: "800", color: "#111" },
  choice: { marginTop: 10, backgroundColor: "#f2f2f2", padding: 12, borderRadius: 12 },
  choiceText: { fontWeight: "700", color: "#111" },
});
