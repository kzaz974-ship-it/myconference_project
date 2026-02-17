import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/api";

type User = { id_user: number; role: "author" | "reviewer" | "chair" };

type Article = {
  id_article: number;
  titre: string;
  statut: string;
  date_soumission: string;
  author_prenom?: string;
  author_nom?: string;
  author_email?: string;
};

export default function SubmissionsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const confId = Number(id);

  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);

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

      const res = await fetch(`${API_URL}/api/chair_articles_by_conf.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confId }),
      });
      const data = await res.json();
      if (!data.success) {
        Alert.alert("Erreur", data.message || "Failed");
        setArticles([]);
      } else {
        setArticles(data.articles || []);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (confId > 0) load();
  }, [confId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f7fa" }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 22, fontWeight: "900" }}>📄 Submissions</Text>
        <TouchableOpacity onPress={load} style={{ backgroundColor: "#111", padding: 10, borderRadius: 12 }}>
          <Text style={{ color: "white", fontWeight: "900" }}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ color: "#666", marginTop: 8 }}>Conference ID: {confId}</Text>

      {loading ? (
        <Text style={{ marginTop: 14, color: "#666" }}>Loading...</Text>
      ) : articles.length === 0 ? (
        <Text style={{ marginTop: 14, color: "#666" }}>No submissions yet.</Text>
      ) : (
        articles.map((a) => (
          <View key={a.id_article} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginTop: 12, borderWidth: 1, borderColor: "#eee" }}>
            <Text style={{ fontWeight: "900", fontSize: 16 }}>{a.titre}</Text>
            <Text style={{ marginTop: 8, color: "#666" }}>Status: {a.statut}</Text>
            <Text style={{ marginTop: 6, color: "#666" }}>Date: {a.date_soumission}</Text>
            <Text style={{ marginTop: 6, color: "#666" }}>
              Author: {a.author_prenom} {a.author_nom} ({a.author_email})
            </Text>
          </View>
        ))
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

