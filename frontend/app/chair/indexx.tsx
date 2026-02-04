import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_URL = "http://192.168.1.146/myconference_api";

export default function ChairDashboard() {
  const router = useRouter();
  const [confs, setConfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const saved = await AsyncStorage.getItem("user");
    if (!saved) return router.replace("/login");
    const u = JSON.parse(saved);

    try {
      const res = await fetch(`${API_URL}/api/chair_my_conferences.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id_user }),
      });

      const data = await res.json();
      if (!data.success) return Alert.alert("Erreur", data.message || "Failed");
      setConfs(data.conferences || []);
    } catch {
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
      <Text style={styles.title}>👩‍🏫 Organizer Dashboard</Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/chair/create-conference")}>
        <Text style={styles.primaryText}>➕ Create Conference</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Conferences</Text>

        {loading ? (
          <Text style={styles.muted}>Loading...</Text>
        ) : confs.length === 0 ? (
          <Text style={styles.muted}>No conferences yet.</Text>
        ) : (
          confs.map((c) => (
            <View key={c.id_conf} style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{c.titre}</Text>
                <Text style={styles.muted}>{c.date_debut || "?"} → {c.date_fin || "?"}</Text>
              </View>

              <TouchableOpacity
  style={styles.manageBtn}
  onPress={() =>
    router.push({
      pathname: "/chair/conf/[id]",
      params: { id: String(c.id_conf) },
    })
  }
>
  <Text style={styles.manageText}>Manage</Text>
</TouchableOpacity>

            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 16 },
  title: { fontSize: 22, fontWeight: "900", marginBottom: 12 },
  primaryBtn: { backgroundColor: "#f4b400", padding: 14, borderRadius: 12, marginBottom: 12 },
  primaryText: { textAlign: "center", fontWeight: "900", color: "#111" },

  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#eee" },
  cardTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },
  muted: { color: "#666" },

  item: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#eee" },
  itemTitle: { fontWeight: "900" },
  manageBtn: { backgroundColor: "#111", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  manageText: { color: "#fff", fontWeight: "900" },
});
