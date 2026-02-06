import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/api";

type Conf = {
  id_conf: number;
  titre: string;
  description?: string;
  date_debut?: string;
  date_fin?: string;
};

export default function ConferencesList() {
  const router = useRouter();
  const [confs, setConfs] = useState<Conf[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/conferences/index.php`);
      const data = await res.json();

      if (!data.success) {
        Alert.alert("Erreur", data.message || "Failed");
        return;
      }

      setConfs(data.conferences || []);
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
        <Text style={styles.title}>📌 Conferences</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={load}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.muted}>Loading...</Text>
      ) : confs.length === 0 ? (
        <Text style={styles.muted}>No conferences yet.</Text>
      ) : (
        confs.map((c) => (
          <View key={c.id_conf} style={styles.card}>
            <Text style={styles.cardTitle}>{c.titre}</Text>
            {!!c.description && <Text style={styles.muted}>{c.description}</Text>}
            <Text style={styles.date}>
              {c.date_debut || "?"} → {c.date_fin || "?"}
            </Text>

            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={() => router.push(`/conferences/${c.id_conf}` as any)}
            >
              <Text style={styles.detailsText}>View details</Text>
            </TouchableOpacity>
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
  refreshBtn: { backgroundColor: "#111", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  refreshText: { color: "#fff", fontWeight: "800" },

  muted: { color: "#666", marginTop: 10 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#eee", marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "900", marginBottom: 6 },
  date: { marginTop: 8, color: "#444", fontWeight: "700" },

  detailsBtn: { backgroundColor: "#f4b400", padding: 12, borderRadius: 12, marginTop: 12 },
  detailsText: { textAlign: "center", fontWeight: "900", color: "#111" },
});
