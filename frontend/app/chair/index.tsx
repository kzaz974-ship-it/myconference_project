import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_URL } from "@/constants/api";

type User = { id_user: number; role: "author" | "reviewer" | "chair"; prenom?: string };
type Conf = { id_conf: number; titre: string; description?: string; date_debut?: string; date_fin?: string };

export default function ChairHome() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [confs, setConfs] = useState<Conf[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const saved = await AsyncStorage.getItem("user");
      if (!saved) return;

      const u = JSON.parse(saved) as User;
      setUser(u);

      if (u.role !== "chair") {
        Alert.alert("Access denied", "Organizer only");
        return;
      }

      const res = await fetch(`${API_URL}/api/chair_my_conferences.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id_user }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert("Erreur", data.message || "Failed to load conferences");
        setConfs([]);
      } else {
        setConfs(data.conferences || []);
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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <Text style={styles.title}>🧑‍💼 Organizer Dashboard</Text>
        <TouchableOpacity style={styles.btn} onPress={load}>
          <Text style={styles.btnText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.bigBtn, { marginTop: 14 }]} onPress={() => router.push("/chair/create-conference")}>
        <Text style={styles.bigBtnText}>＋ Create Conference</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.bigBtn, { marginTop: 10 }]} onPress={() => router.push("/chair/create-reviewer")}>
        <Text style={styles.bigBtnText}>＋ Add Reviewer</Text>
      </TouchableOpacity>

      <Text style={styles.section}>My Conferences</Text>

      {loading ? (
        <Text style={styles.muted}>Loading...</Text>
      ) : confs.length === 0 ? (
        <Text style={styles.muted}>No conferences yet. Create your first one ✅</Text>
      ) : (
        confs.map((c) => (
          <View key={c.id_conf} style={styles.card}>
            <Text style={styles.cardTitle}>{c.titre}</Text>
            <Text style={styles.muted}>ID: {c.id_conf}</Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => router.push(`/chair/conf/${c.id_conf}/submissions`)}
              >
                <Text style={styles.smallBtnText}>Submissions</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => router.push(`/chair/conf/${c.id_conf}/assign`)}
              >
                <Text style={styles.smallBtnText}>Assign</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => router.push(`/chair/conf/${c.id_conf}/reviews`)}
              >
                <Text style={styles.smallBtnText}>Reviews</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "900" },

  btn: { backgroundColor: "#111", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "900" },

  bigBtn: { backgroundColor: "#ffbf00", padding: 14, borderRadius: 14, alignItems: "center" },
  bigBtnText: { fontWeight: "900" },

  section: { marginTop: 18, fontSize: 16, fontWeight: "900" },
  muted: { color: "#666", marginTop: 10 },

  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#eee", marginTop: 12 },
  cardTitle: { fontSize: 15, fontWeight: "900", color: "#111" },

  row: { flexDirection: "row", gap: 8, marginTop: 12 },
  smallBtn: { flex: 1, backgroundColor: "#111", padding: 10, borderRadius: 12, alignItems: "center" },
  smallBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
});
