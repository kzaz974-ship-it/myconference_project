import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { API_URL } from "../constants/api";

type User = {
  id_user: number;
  nom: string;
  prenom: string;
  email: string;
  role: "author" | "reviewer" | "chair";
  affiliation?: string;
  country?: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [conferences, setConferences] = useState<any[]>([]);
  const [myArticles, setMyArticles] = useState<any[]>([]);
  const [myConfs, setMyConfs] = useState<any[]>([]);
  const [myRegs, setMyRegs] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);

    try {
      const saved = await AsyncStorage.getItem("user");

      if (!saved) {
        router.replace("/login" as any);
        return;
      }

      const u: User = JSON.parse(saved);
      setUser(u);

      const res = await fetch(`${API_URL}/api/dashboard.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id_user }),
      });

      const data = await res.json();

      if (!data.success) {
        Alert.alert("Erreur", data.message || "Dashboard failed");
        return;
      }

      setConferences(data.conferences || []);
      setMyArticles(data.myArticles || []);
      setMyConfs(data.myConferences || []);
      setMyRegs(data.myRegistrations || []);
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  // أول مرة
  useEffect(() => {
    load();
  }, []);

  // كل مرة كترجعي للصفحة (بعد create conference مثلا)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const logout = async () => {
    await AsyncStorage.removeItem("user"); // ✅ ماشي clear
    router.replace("/login" as any);
  };

  if (!user) return null;

  const roleLabel =
    user.role === "chair"
      ? "Organizer / Chair"
      : user.role === "reviewer"
      ? "Reviewer"
      : "Author";

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>👋 Welcome back, {user.prenom}</Text>
          <Text style={styles.sub}>
            Manage your conferences and articles with ease
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Roles */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔵 Roles / Permissions</Text>
        <Text style={styles.cardText}>
          Your role: <Text style={styles.bold}>{roleLabel}</Text>
        </Text>

        <View style={styles.roleRow}>
          <RolePill
            active={user.role === "author"}
            text="✅ Author → submit articles"
          />
          <RolePill
            active={user.role === "chair"}
            text="✅ Organizer → manage conferences"
          />
          <RolePill
            active={user.role === "reviewer"}
            text="✅ Reviewer → review papers"
          />
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔵 Quick Actions</Text>

        {/* Organizer (chair) */}
        {user.role === "chair" && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.chairBtn]}
            onPress={() => router.push("/chair" as any)}
          >
            <Text style={[styles.actionText, styles.white]}>
              🟠 Organizer Dashboard
            </Text>
          </TouchableOpacity>
        )}

        {/* Author */}
        {user.role === "author" && (
          <>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push("/articles/create" as any)}
            >
              <Text style={styles.actionText}>🟢 Create Article</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push("/conferences" as any)}
            >
              <Text style={styles.actionText}>🟢 View Conferences</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push("/articles/mine" as any)}
            >
              <Text style={styles.actionText}>🟢 View My Submissions</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Reviewer */}
        {user.role === "reviewer" && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert("Soon", "Reviewer page next ✅")}
          >
            <Text style={styles.actionText}>🟣 My Assignments</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* My activity */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔵 My Activity</Text>

        <StatRow label="📄 My Articles" value={myArticles.length} />
        <StatRow label="🎤 My Conferences" value={myConfs.length} />
        <StatRow label="📅 Registered Conferences" value={myRegs.length} />

        {myArticles.length === 0 && (
          <Text style={styles.emptyText}>
            You haven’t created any articles yet.
          </Text>
        )}
      </View>

      {/* Conferences list */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📌 Conferences</Text>

        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : conferences.length === 0 ? (
          <Text style={styles.emptyText}>No conferences yet.</Text>
        ) : (
          conferences.map((c) => (
            <View key={c.id_conf} style={styles.item}>
              <Text style={styles.itemTitle}>{c.titre}</Text>
              <Text style={styles.itemSub}>
                {c.date_debut || "?"} → {c.date_fin || "?"}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function RolePill({ active, text }: { active: boolean; text: string }) {
  return (
    <View style={[styles.pill, active ? styles.pillActive : styles.pillOff]}>
      <Text
        style={[
          styles.pillText,
          active ? styles.pillTextActive : styles.pillTextOff,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcome: { fontSize: 22, fontWeight: "bold", color: "#1a1a1a" },
  sub: { marginTop: 4, color: "#666" },
  logoutBtn: {
    backgroundColor: "#111",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  logoutText: { color: "#fff", fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  cardText: { color: "#333" },
  bold: { fontWeight: "800" },

  roleRow: { marginTop: 12, gap: 10 },
  pill: { padding: 12, borderRadius: 12 },
  pillActive: {
    backgroundColor: "#E8F0FE",
    borderWidth: 1,
    borderColor: "#4285F4",
  },
  pillOff: { backgroundColor: "#f2f2f2" },
  pillText: { fontSize: 13 },
  pillTextActive: { color: "#1a1a1a", fontWeight: "700" },
  pillTextOff: { color: "#666" },

  actionBtn: {
    backgroundColor: "#f4b400",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  chairBtn: { backgroundColor: "#111" },
  actionText: { fontWeight: "900", textAlign: "center", color: "#1a1a1a" },
  white: { color: "#fff" },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  statLabel: { color: "#333", fontWeight: "600" },
  statValue: { fontWeight: "900" },

  item: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#eee" },
  itemTitle: { fontWeight: "800", color: "#111" },
  itemSub: { color: "#666", marginTop: 3 },

  emptyText: { marginTop: 10, color: "#666" },
});
