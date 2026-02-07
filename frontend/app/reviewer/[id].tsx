import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { API_URL } from "@/constants/api";

type User = {
  id_user: number;
  role: "author" | "reviewer" | "chair";
  prenom?: string;
};

type Article = {
  id_article: number;
  titre: string;
  statut: "soumis" | "en_review" | "accepte" | "rejete";
  date_soumission?: string;
};

type Reviewer = {
  id_user: number;
  nom: string;
  prenom: string;
  email: string;
};

type Review = {
  id_review: number;
  id_reviewer: number;
  note: number | null;
  decision: "accepte" | "rejete" | "mineur" | "majeur" | null;
  commentaire: string | null;
  reviewer_name?: string;
};

export default function ManageConference() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const confId = Number(id);

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [articles, setArticles] = useState<Article[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);

  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null
  );

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const selectedArticle = useMemo(() => {
    if (!selectedArticleId) return null;
    return articles.find((a) => a.id_article === selectedArticleId) || null;
  }, [selectedArticleId, articles]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const saved = await AsyncStorage.getItem("user");
      if (!saved) return router.replace("/login" as any);

      const u = JSON.parse(saved) as User;
      setUser(u);

      if (u.role !== "chair") {
        Alert.alert("Access denied", "Organizer only");
        return router.replace("/dashboard" as any);
      }

      // 1) Articles by conference
      const aRes = await fetch(`${API_URL}/api/chair_articles_by_conf.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id_user, confId }),
      });
      const aData = await aRes.json();
      if (!aData.success) {
        setArticles([]);
        Alert.alert("Erreur", aData.message || "Failed to load articles");
      } else {
        setArticles(aData.articles || []);
      }

      // 2) Reviewers list
      const rRes = await fetch(`${API_URL}/api/chair_reviewers_list.php`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const rData = await rRes.json();
      if (!rData.success) {
        setReviewers([]);
        Alert.alert("Erreur", rData.message || "Failed to load reviewers");
      } else {
        setReviewers(rData.reviewers || []);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (articleId: number) => {
    setLoadingReviews(true);
    setReviews([]);
    try {
      const res = await fetch(`${API_URL}/api/chair_reviews_by_article.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const data = await res.json();
      if (!data.success) {
        Alert.alert("Erreur", data.message || "Failed to load reviews");
        return;
      }
      setReviews(data.reviews || []);
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    } finally {
      setLoadingReviews(false);
    }
  };

  const assignReviewer = async (articleId: number, reviewerId: number) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/chair_assign_reviewer.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id_user,
          articleId,
          reviewerId,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert("Erreur", data.message || "Assign failed");
        return;
      }

      Alert.alert("✅ Assigned", "Reviewer assigned");
      await loadAll();

      // reload reviews panel if same article selected
      if (selectedArticleId === articleId) {
        loadReviews(articleId);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    }
  };

  const decide = async (articleId: number, statut: "accepte" | "rejete") => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/chair_decide_article.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id_user, articleId, statut }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert("Erreur", data.message || "Decision failed");
        return;
      }

      Alert.alert("✅ Done", `Article ${statut}`);
      await loadAll();
      if (selectedArticleId === articleId) loadReviews(articleId);
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>⚙️ Manage Conference</Text>
          <Text style={styles.sub}>Conference ID: {confId}</Text>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={loadAll}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Submissions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📄 Submissions</Text>

        {loading ? (
          <Text style={styles.muted}>Loading...</Text>
        ) : articles.length === 0 ? (
          <Text style={styles.muted}>No submissions yet.</Text>
        ) : (
          articles.map((a) => (
            <TouchableOpacity
              key={a.id_article}
              style={[
                styles.row,
                selectedArticleId === a.id_article && styles.rowActive,
              ]}
              onPress={() => {
                setSelectedArticleId(a.id_article);
                loadReviews(a.id_article);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{a.titre}</Text>
                <Text style={styles.muted}>
                  Status: {a.statut}{" "}
                  {a.date_soumission ? `• ${a.date_soumission}` : ""}
                </Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>#{a.id_article}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Assign reviewers */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👩‍⚖️ Assign Reviewers</Text>

        {!selectedArticle ? (
          <Text style={styles.muted}>Select an article first.</Text>
        ) : reviewers.length === 0 ? (
          <Text style={styles.muted}>
            No reviewers found. Create reviewers first.
          </Text>
        ) : (
          <View>
            <Text style={styles.muted}>
              Selected: #{selectedArticle.id_article} — {selectedArticle.titre}
            </Text>

            {reviewers.map((r) => (
              <TouchableOpacity
                key={r.id_user}
                style={styles.reviewerRow}
                onPress={() =>
                  assignReviewer(selectedArticle.id_article, r.id_user)
                }
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewerName}>
                    {r.prenom} {r.nom}
                  </Text>
                  <Text style={styles.muted}>{r.email}</Text>
                </View>

                <Text style={styles.assignText}>Assign</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Reviews & Decision */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⭐ Reviews & Notes</Text>

        {!selectedArticle ? (
          <Text style={styles.muted}>Select an article to view reviews.</Text>
        ) : (
          <View>
            <Text style={styles.muted}>
              Article: #{selectedArticle.id_article} • Status:{" "}
              {selectedArticle.statut}
            </Text>

            {loadingReviews ? (
              <Text style={styles.muted}>Loading reviews...</Text>
            ) : reviews.length === 0 ? (
              <Text style={styles.muted}>No reviews yet.</Text>
            ) : (
              reviews.map((rv) => (
                <View key={rv.id_review} style={styles.reviewCard}>
                  <Text style={styles.reviewTitle}>
                    Reviewer #{rv.id_reviewer}{" "}
                    {rv.reviewer_name ? `• ${rv.reviewer_name}` : ""}
                  </Text>
                  <Text style={styles.muted}>
                    Decision: {rv.decision ?? "—"} | Note: {rv.note ?? "—"}
                  </Text>
                  {!!rv.commentaire && (
                    <Text style={styles.reviewText}>{rv.commentaire}</Text>
                  )}
                </View>
              ))
            )}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#2e7d32" }]}
                onPress={() => decide(selectedArticle.id_article, "accepte")}
              >
                <Text style={styles.actionBtnText}>Accept ✅</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#c62828" }]}
                onPress={() => decide(selectedArticle.id_article, "rejete")}
              >
                <Text style={styles.actionBtnText}>Reject ❌</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "900" },
  sub: { color: "#666", marginTop: 6 },

  refreshBtn: {
    backgroundColor: "#111",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  refreshText: { color: "#fff", fontWeight: "900" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },
  muted: { color: "#666", marginTop: 6 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  rowActive: {
    backgroundColor: "#E8F0FE",
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  rowTitle: { fontWeight: "900", fontSize: 14 },

  badge: {
    backgroundColor: "#111",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 10,
  },
  badgeText: { color: "#fff", fontWeight: "900" },

  reviewerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    marginTop: 10,
  },
  reviewerName: { fontWeight: "900" },
  assignText: { fontWeight: "900", color: "#111" },

  reviewCard: {
    backgroundColor: "#f7f7f7",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  reviewTitle: { fontWeight: "900" },
  reviewText: { marginTop: 8, color: "#111" },

  actionBtn: { flex: 1, padding: 12, borderRadius: 12 },
  actionBtnText: { color: "#fff", textAlign: "center", fontWeight: "900" },

  backBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#111",
    padding: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  backText: { textAlign: "center", fontWeight: "900", color: "#111" },
});
