import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, router } from "expo-router";
import { API_URL } from "@/constants/api";

type User = { id_user: number; role: "author" | "reviewer" | "chair" };

type AssignmentInfo = {
  id_article: number;
  titre: string;
  statut: string;
  pdf_url: string | null;

  conf_titre: string;
  author_prenom: string;
  author_nom: string;
  author_email: string;

  assigned_at: string;
  assignment_status: string;
};

export default function ReviewArticle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const articleId = Number(id);

  const [info, setInfo] = useState<AssignmentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [note, setNote] = useState("");
  const [decision, setDecision] = useState<"mineur" | "majeur" | "accepte" | "rejete">("mineur");
  const [commentaire, setCommentaire] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const saved = await AsyncStorage.getItem("user");
      if (!saved) return;
      const u = JSON.parse(saved) as User;

      if (u.role !== "reviewer") {
        Alert.alert("Access denied", "Reviewer only");
        return;
      }

      // نجيبو info من نفس endpoint reviewer_assignments.php ونقلبو على articleId
      const res = await fetch(`${API_URL}/api/reviewer_assignments.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewerId: u.id_user }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert("Erreur", data.message || "Failed to load");
        setInfo(null);
      } else {
        const found = (data.assignments || []).find((x: any) => Number(x.id_article) === articleId);
        if (!found) {
          Alert.alert("Not found", "This article is not assigned to you");
          setInfo(null);
        } else {
          setInfo(found);
        }
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const openPdf = async () => {
    if (!info?.pdf_url) {
      Alert.alert("PDF", "No PDF for this article");
      return;
    }
    const can = await Linking.canOpenURL(info.pdf_url);
    if (!can) {
      Alert.alert("PDF", "Cannot open PDF url");
      return;
    }
    await Linking.openURL(info.pdf_url);
  };

  const submit = async () => {
    try {
      const saved = await AsyncStorage.getItem("user");
      if (!saved) return;
      const u = JSON.parse(saved) as User;

      const n = Number(note);
      if (!Number.isFinite(n) || n < 0 || n > 10) {
        Alert.alert("Erreur", "Note must be between 0 and 10");
        return;
      }

      const res = await fetch(`${API_URL}/api/reviewer_submit_review.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerId: u.id_user,
          articleId,
          note: n,
          decision,
          commentaire,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert("Erreur", data.message || "Submit failed");
        return;
      }

      Alert.alert("✅ Done", data.message || "Review submitted");
      router.back();
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    }
  };

  useEffect(() => {
    if (Number.isFinite(articleId) && articleId > 0) load();
  }, [articleId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f7fa" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "900" }}>📝 Review Article #{articleId}</Text>

      {loading ? (
        <Text style={{ marginTop: 12, color: "#666" }}>Loading...</Text>
      ) : !info ? (
        <Text style={{ marginTop: 12, color: "#666" }}>No info found.</Text>
      ) : (
        <View style={{ marginTop: 12, backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#eee" }}>
          <Text style={{ fontSize: 16, fontWeight: "900" }}>{info.titre}</Text>
          <Text style={{ marginTop: 6, color: "#444" }}>Conference: {info.conf_titre}</Text>
          <Text style={{ marginTop: 6, color: "#444" }}>
            Author: {info.author_prenom} {info.author_nom} ({info.author_email})
          </Text>
          <Text style={{ marginTop: 6, color: "#666" }}>Assigned at: {info.assigned_at}</Text>
          <Text style={{ marginTop: 6, color: "#666" }}>Article status: {info.statut}</Text>

          <TouchableOpacity
            onPress={openPdf}
            style={{
              marginTop: 12,
              backgroundColor: info.pdf_url ? "#111" : "#bbb",
              padding: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>{info.pdf_url ? "📄 Open PDF" : "No PDF"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FORM */}
      <Text style={{ marginTop: 16, fontWeight: "900" }}>Note (0-10)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        keyboardType="numeric"
        placeholder="e.g. 8"
        style={{ backgroundColor: "#fff", borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: "#eee" }}
      />

      <Text style={{ marginTop: 16, fontWeight: "900" }}>Decision</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
        {(["mineur", "majeur", "accepte", "rejete"] as const).map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => setDecision(d)}
            style={{
              backgroundColor: decision === d ? "#111" : "#eee",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: decision === d ? "white" : "#111", fontWeight: "900" }}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ marginTop: 16, fontWeight: "900" }}>Commentaire</Text>
      <TextInput
        value={commentaire}
        onChangeText={setCommentaire}
        placeholder="Write your feedback..."
        multiline
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 12,
          marginTop: 8,
          borderWidth: 1,
          borderColor: "#eee",
          minHeight: 120,
          textAlignVertical: "top",
        }}
      />

      <TouchableOpacity
        onPress={submit}
        style={{ marginTop: 16, backgroundColor: "#111", padding: 14, borderRadius: 14, alignItems: "center" }}
      >
        <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>Submit Review</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

