import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_URL = "http://127.0.0.1/myconference_project/backend";


type Conf = {
  id_conf: number;
  titre: string;
  description?: string;
  date_debut?: string;
  date_fin?: string;
};

type User = {
  id_user: number;
  role: "author" | "reviewer" | "chair";
  prenom: string;
};

export default function ChairDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [confs, setConfs] = useState<Conf[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<{ myConferences: number }>({ myConferences: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const saved = await AsyncStorage.getItem("user");
      if (!saved) return router.replace("/login");

      const u = JSON.parse(saved) as User;
      setUser(u);

      if (u.role !== "chair") {
        Alert.alert("Access denied", "This page is for Organizer/Chair only.");
        return router.replace("/dashboard");
      }

      const res = await fetch(`${API_URL}/api/chair_my_conferences.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id_user }),
      });

      const data = await res.json();
      if (!data.success) return Alert.alert("Erreur", data.message || "Failed");

      setConfs(data.conferences || []);
      setStats(data.stats || { myConferences: (data.conferences || []).length });
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>👩‍🏫 Organizer Dashboard</Text>
          <Text style={styles.sub}>Welcome, {user.prenom} — manage your conferences</Text>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={load}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Top Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/chair/create-conference" as any)}
        >
          <Text style={styles.primaryText}>➕ Create Conference</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="My Conferences" value={stats.myConferences} />
        <StatCard label="Submissions" value={0} />
        <StatCard label="Registrations" value={0} />
      </View>

      {/* My Conferences */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📌 My Conferences</Text>

        {loading ? (
          <Text style={styles.muted}>Loading...</Text>
        ) : confs.length === 0 ? (
          <Text style={styles.muted}>No conferences yet. Create your first one ✅</Text>
        ) : (
          confs.map((c) => (
            <View key={c.id_conf} style={styles.confItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.confTitle}>{c.titre}</Text>
                <Text style={styles.muted}>
                  {c.date_debut || "?"} → {c.date_fin || "?"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.manageBtn}
                onPress={() => router.push(`/chair/conf/${c.id_conf}` as any)}
              >
                <Text style={styles.manageText}>Manage</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 16 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "900" },
  sub: { color: "#666", marginTop: 4 },

  refreshBtn: { backgroundColor: "#111", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  refreshText: { color: "#fff", fontWeight: "800" },

  actionsRow: { marginBottom: 12 },
  primaryBtn: { backgroundColor: "#f4b400", padding: 14, borderRadius: 14 },
  primaryText: { fontWeight: "900", textAlign: "center", color: "#111" },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#eee" },
  statValue: { fontSize: 20, fontWeight: "900" },
  statLabel: { color: "#666", marginTop: 4, fontWeight: "700", fontSize: 12 },

  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#eee" },
  cardTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },

  muted: { color: "#666" },

  confItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#eee" },
  confTitle: { fontWeight: "900", fontSize: 14 },

  manageBtn: { backgroundColor: "#111", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, marginLeft: 10 },
  manageText: { color: "#fff", fontWeight: "900" },
});
