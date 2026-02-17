import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
  id_conf: number;
  conf_titre: string;
};

export default function ReviewerAssignments() {
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f7fa" }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 22, fontWeight: "900" }}>📌 My Assignments</Text>
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
          <TouchableOpacity
            key={a.id_assignment}
            onPress={() =>
  router.push({
    pathname: "/reviewer/review/[id]" as const,
    params: { id: String(a.id_article) },
  })
}

            style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginTop: 12, borderWidth: 1, borderColor: "#eee" }}
          >
            <Text style={{ fontWeight: "900", fontSize: 16 }}>{a.titre}</Text>
            <Text style={{ marginTop: 6, color: "#666" }}>Conference: {a.conf_titre}</Text>
            <Text style={{ marginTop: 6, color: "#666" }}>Article status: {a.statut}</Text>
            <Text style={{ marginTop: 6, color: "#666" }}>Assignment status: {a.assignment_status}</Text>
            <Text style={{ marginTop: 6, color: "#666" }}>Assigned at: {a.assigned_at}</Text>
            <Text style={{ marginTop: 10, fontWeight: "900" }}>➡️ Open review form</Text>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}
