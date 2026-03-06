import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { API_URL } from "@/constants/api";

type ChairReviewRow = {
  reviewer: string;
  article: string;
  conference: string;
  assigned_at?: string | null;
  deadline?: string | null;
  submitted_at?: string | null;
  note?: number | null;
  commentaire?: string | null;
  status: string;
};

export default function ChairReviewsPage() {
  const [rows, setRows] = useState<ChairReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const saved = await AsyncStorage.getItem("user");
      if (!saved) return;

      const u = JSON.parse(saved);

      const res = await fetch(`${API_URL}/api/chair_reviews.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chairId: u.id_user }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed");

      setRows(data.rows || []);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📋 Reviews</Text>

      {loading ? (
        <Text style={styles.empty}>Loading...</Text>
      ) : rows.length === 0 ? (
        <Text style={styles.empty}>No reviews found.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 140 }]}>Reviewer</Text>
              <Text style={[styles.th, { width: 220 }]}>Article</Text>
              <Text style={[styles.th, { width: 180 }]}>Conference</Text>
              <Text style={[styles.th, { width: 140 }]}>Assigned</Text>
              <Text style={[styles.th, { width: 90 }]}>Note</Text>
              <Text style={[styles.th, { width: 240 }]}>Comment</Text>
              <Text style={[styles.th, { width: 110 }]}>Status</Text>
            </View>

            {rows.map((r, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.td, { width: 140 }]}>{r.reviewer}</Text>
                <Text style={[styles.td, { width: 220 }]}>{r.article}</Text>
                <Text style={[styles.td, { width: 180 }]}>{r.conference}</Text>
                <Text style={[styles.td, { width: 140 }]}>{r.assigned_at || "-"}</Text>
                <Text style={[styles.td, { width: 90 }]}>{r.note ?? "-"}</Text>
                <Text style={[styles.td, { width: 240 }]} numberOfLines={1}>
                  {r.commentaire ?? "-"}
                </Text>
                <Text style={[styles.td, { width: 110 }]}>{r.status}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 16 },
  title: { fontSize: 18, fontWeight: "900", marginBottom: 12 },
  empty: { color: "#666", marginTop: 10 },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5ff",
    borderWidth: 1,
    borderColor: "#dbe6ff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#eee",
    borderTopWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  th: { fontWeight: "900", color: "#1a1a1a" },
  td: { color: "#333" },
});