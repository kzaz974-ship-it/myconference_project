import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { API_URL } from "@/constants/api";

type User = { id_user: number; role: "author" | "reviewer" | "chair" };

type Assignment = {
  id_assignment: number;
  assignment_status: string;
  assigned_at: string;

  id_article: number;
  titre: string;
  statut: string;
  date_soumission: string;

  id_conf: number;
  conf_titre: string;

  author_prenom: string;
  author_nom: string;
  author_email: string;

  fichier_pdf: string | null;
  pdf_url: string | null;
};

export default function ReviewerDashboard() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

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

      const res = await fetch(`${API_URL}/api/reviewer_assignments.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewerId: u.id_user }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert("Erreur", data.message || "Failed");
        setItems([]);
      } else {
        setItems(data.assignments || []);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openPdf = async (url: string | null) => {
    if (!url) {
      Alert.alert("PDF", "No PDF for this article");
      return;
    }
    const ok = await Linking.canOpenURL(url);
    if (!ok) {
      Alert.alert("PDF", "Cannot open PDF URL");
      return;
    }
    Linking.openURL(url);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f7fa" }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 22, fontWeight: "900" }}>📚 Reviewer Dashboard</Text>
        <TouchableOpacity onPress={load} style={{ backgroundColor: "#111", padding: 10, borderRadius: 12 }}>
          <Text style={{ color: "white", fontWeight: "900" }}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={{ marginTop: 14, color: "#666" }}>Loading...</Text>
      ) : items.length === 0 ? (
        <Text style={{ marginTop: 14, color: "#666" }}>No assigned articles yet.</Text>
      ) : (
        items.map((a) => (
          <View
            key={a.id_assignment}
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              marginTop: 12,
              borderWidth: 1,
              borderColor: "#eee",
            }}
          >
            <Text style={{ fontWeight: "900", fontSize: 16 }}>{a.titre}</Text>

            <Text style={{ marginTop: 8, color: "#666" }}>
              Conference: <Text style={{ fontWeight: "800", color: "#111" }}>{a.conf_titre}</Text>
            </Text>

            <Text style={{ marginTop: 6, color: "#666" }}>
              Author: <Text style={{ fontWeight: "800", color: "#111" }}>
                {a.author_prenom} {a.author_nom}
              </Text>{" "}
              ({a.author_email})
            </Text>

            <Text style={{ marginTop: 6, color: "#666" }}>Assigned at: {a.assigned_at}</Text>
            <Text style={{ marginTop: 6, color: "#666" }}>Assignment status: {a.assignment_status}</Text>
            <Text style={{ marginTop: 6, color: "#666" }}>Article status: {a.statut}</Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                onPress={() => openPdf(a.pdf_url)}
                style={{
                  backgroundColor: a.pdf_url ? "#0b5" : "#aaa",
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "white", fontWeight: "900" }}>
                  {a.pdf_url ? "Open PDF" : "No PDF"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/reviewer/review/[id]" as const,
                    params: { id: String(a.id_article) },
                  })
                }
                style={{
                  backgroundColor: "#111",
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "white", fontWeight: "900" }}>✍️ Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}
