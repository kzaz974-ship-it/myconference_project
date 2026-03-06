import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { API_URL } from "@/constants/api";

type ChairAuthorRow = {
  id_author: number;
  author: string;
  affiliation?: string | null;
  country?: string | null;
  article: string;
  conference: string;
  decision: string;
};

export default function ChairAuthorsPage() {
  const [rows, setRows] = useState<ChairAuthorRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const saved = await AsyncStorage.getItem("user");
      if (!saved) return;

      const u = JSON.parse(saved);

      const res = await fetch(`${API_URL}/api/chair_authors.php`, {
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
      <Text style={styles.title}>👤 Authors</Text>

      {loading ? (
        <Text style={styles.empty}>Loading...</Text>
      ) : rows.length === 0 ? (
        <Text style={styles.empty}>No authors found.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 70 }]}>ID</Text>
              <Text style={[styles.th, { width: 170 }]}>Author</Text>
              <Text style={[styles.th, { width: 220 }]}>Affiliation</Text>
              <Text style={[styles.th, { width: 120 }]}>Country</Text>
              <Text style={[styles.th, { width: 240 }]}>Article</Text>
              <Text style={[styles.th, { width: 200 }]}>Conference</Text>
              <Text style={[styles.th, { width: 110 }]}>Decision</Text>
            </View>

            {rows.map((a, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.td, { width: 70 }]}>{a.id_author}</Text>
                <Text style={[styles.td, { width: 170 }]}>{a.author}</Text>
                <Text style={[styles.td, { width: 220 }]} numberOfLines={1}>
                  {a.affiliation ?? "-"}
                </Text>
                <Text style={[styles.td, { width: 120 }]}>{a.country ?? "-"}</Text>
                <Text style={[styles.td, { width: 240 }]}>{a.article}</Text>
                <Text style={[styles.td, { width: 200 }]}>{a.conference}</Text>
                <Text style={[styles.td, { width: 110 }]}>{a.decision}</Text>
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