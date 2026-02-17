import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { API_URL } from "@/constants/api";

type Review = {
  id_review: number;
  note: number | null;
  commentaire: string | null;
  decision: "accepte" | "rejete" | "mineur" | "majeur" | null;
  created_at: string;
  reviewer_name: string;
  reviewer_email: string;
};

type ArticleBlock = {
  id_article: number;
  titre: string;
  statut: string;
  reviews: Review[];
};

export default function ChairReviewsByConf() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const confId = Number(id);

  const [items, setItems] = useState<ArticleBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chair_reviews_by_conf.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confId }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert("Erreur", data.message || "Failed");
        setItems([]);
      } else {
        setItems(data.articles || []);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const decide = async (articleId: number, decision: "accepte" | "rejete") => {
    try {
      const res = await fetch(`${API_URL}/api/chair_decide_article.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, decision }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert("Erreur", data.message || "Decision failed");
        return;
      }

      Alert.alert("✅ Done", `Article marked as ${decision}`);
      // update locally
      setItems((prev) =>
        prev.map((x) =>
          x.id_article === articleId ? { ...x, statut: decision } : x
        )
      );
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    }
  };

  useEffect(() => {
    if (Number.isFinite(confId)) load();
  }, [confId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f7fa" }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "900" }}>📚 Conference Reviews</Text>
          <Text style={{ marginTop: 4, color: "#666" }}>Conference ID: {confId}</Text>
        </View>

        <TouchableOpacity onPress={load} style={{ backgroundColor: "#111", padding: 10, borderRadius: 12 }}>
          <Text style={{ color: "white", fontWeight: "900" }}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={{ marginTop: 14, color: "#666" }}>Loading...</Text>
      ) : items.length === 0 ? (
        <Text style={{ marginTop: 14, color: "#666" }}>No reviews yet for this conference.</Text>
      ) : (
        items.map((a) => (
          <View
            key={a.id_article}
            style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginTop: 12, borderWidth: 1, borderColor: "#eee" }}
          >
            <Text style={{ fontWeight: "900", fontSize: 16 }}>{a.titre}</Text>
            <Text style={{ marginTop: 6, color: "#666" }}>Current status: {a.statut}</Text>

            <Text style={{ marginTop: 12, fontWeight: "900" }}>Reviews:</Text>
            {a.reviews?.length ? (
              a.reviews.map((r) => (
                <View key={r.id_review} style={{ marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: "#f3f4f6" }}>
                  <Text style={{ fontWeight: "900" }}>👤 {r.reviewer_name} ({r.reviewer_email})</Text>
                  <Text style={{ marginTop: 4 }}>Note: {r.note}/10</Text>
                  <Text style={{ marginTop: 4 }}>Decision: {r.decision}</Text>
                  <Text style={{ marginTop: 4 }}>{r.commentaire}</Text>
                  <Text style={{ marginTop: 4, color: "#666" }}>At: {r.created_at}</Text>
                </View>
              ))
            ) : (
              <Text style={{ marginTop: 6, color: "#666" }}>No review details yet.</Text>
            )}

            <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
              <TouchableOpacity
                onPress={() => decide(a.id_article, "accepte")}
                style={{ flex: 1, backgroundColor: "#111", padding: 14, borderRadius: 14, alignItems: "center" }}
              >
                <Text style={{ color: "white", fontWeight: "900" }}>✅ Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => decide(a.id_article, "rejete")}
                style={{ flex: 1, backgroundColor: "#ddd", padding: 14, borderRadius: 14, alignItems: "center" }}
              >
                <Text style={{ color: "#111", fontWeight: "900" }}>❌ Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}
