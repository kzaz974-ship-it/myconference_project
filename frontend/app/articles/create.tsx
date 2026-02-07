import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_URL } from "@/constants/api";

type Conf = {
  id_conf: number;
  titre: string;
};

export default function CreateArticle() {
  const router = useRouter();

  const [confs, setConfs] = useState<Conf[]>([]);
  const [confId, setConfId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");

  // web pdf
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [loadingConfs, setLoadingConfs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadConfs = async () => {
    setLoadingConfs(true);
    try {
      // ✅ correct endpoint
      const res = await fetch(`${API_URL}/api/conferences_list.php`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const data = await res.json();

      if (!data?.success) {
        setConfs([]);
        return;
      }

      const list = Array.isArray(data?.conferences) ? data.conferences : [];

      const cleaned: Conf[] = list
        .map((x: any) => ({
          id_conf: Number(x.id_conf),
          titre: String(x.titre ?? ""),
        }))
        .filter((x: Conf) => x.id_conf && x.titre);

      setConfs(cleaned);

      // default select first
      if (cleaned.length > 0) setConfId(cleaned[0].id_conf);
      else setConfId(null);
    } catch (e) {
      console.log(e);
      setConfs([]);
      Alert.alert("Erreur", "Impossible de charger les conferences");
    } finally {
      setLoadingConfs(false);
    }
  };

  useEffect(() => {
    loadConfs();
  }, []);

  const confLabel = useMemo(() => {
    if (!confId) return "—";
    const c = confs.find((x) => x.id_conf === confId);
    return c?.titre ?? "—";
  }, [confId, confs]);

  const submit = async () => {
    if (!confId) return Alert.alert("Erreur", "Choisis une conference");
    if (!title.trim()) return Alert.alert("Erreur", "Title required");
    if (!abstract.trim()) return Alert.alert("Erreur", "Abstract required");

    // PDF only on web
    if (Platform.OS === "web" && !pdfFile) {
      return Alert.alert("Erreur", "Choisis un PDF");
    }

    setSubmitting(true);

    try {
      const saved = await AsyncStorage.getItem("user");
      if (!saved) return router.replace("/login" as any);
      const u = JSON.parse(saved);

      const fd = new FormData();
      fd.append("userId", String(u.id_user));
      fd.append("confId", String(confId));
      fd.append("title", title);
      fd.append("abstract", abstract);

      if (Platform.OS === "web" && pdfFile) {
        fd.append("pdf", pdfFile);
      }

      const res = await fetch(`${API_URL}/api/articles/create.php`, {
        method: "POST",
        body: fd as any,
      });

      const text = await res.text();
      let out: any = null;

      try {
        out = JSON.parse(text);
      } catch {
        console.log("create article not json:", text);
        Alert.alert("Erreur", "Server response not JSON (check console)");
        return;
      }

      if (!out.success) {
        Alert.alert("Erreur", out.message || "Failed");
        return;
      }

      Alert.alert("✅ Success", "Article submitted");
      router.back();
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Server not reachable");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>📝 Create Article</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Conference</Text>

        {loadingConfs ? (
          <View style={{ paddingVertical: 10 }}>
            <ActivityIndicator />
            <Text style={styles.muted}>Loading conferences...</Text>
          </View>
        ) : confs.length === 0 ? (
          <Text style={styles.error}>
            No conferences found. (Create a conference as Chair first)
          </Text>
        ) : (
          <View>
            {confs.map((c) => (
              <TouchableOpacity
                key={c.id_conf}
                style={[
                  styles.choice,
                  confId === c.id_conf && styles.choiceActive,
                ]}
                onPress={() => setConfId(c.id_conf)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    confId === c.id_conf && styles.choiceTextActive,
                  ]}
                >
                  {c.titre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Selected</Text>
        <Text style={styles.selected}>{confLabel}</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Article title"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Abstract / Résumé</Text>
        <TextInput
          style={[styles.input, { height: 140 }]}
          multiline
          placeholder="Write a short abstract..."
          value={abstract}
          onChangeText={setAbstract}
        />

        {Platform.OS === "web" && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>PDF</Text>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setPdfFile(f);
              }}
            />
            {!!pdfFile && (
              <Text style={styles.muted}>Selected: {pdfFile.name}</Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.btn, submitting && { opacity: 0.6 }]}
          onPress={submit}
          disabled={submitting}
        >
          <Text style={styles.btnText}>
            {submitting ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  title: { fontSize: 24, fontWeight: "900", marginBottom: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
  },

  label: { fontWeight: "800", marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  btn: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "900" },

  muted: { color: "#666", marginTop: 6 },
  error: { color: "crimson", fontWeight: "700" },

  selected: { marginBottom: 12, color: "#111", fontWeight: "700" },

  choice: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    marginBottom: 10,
  },
  choiceActive: {
    backgroundColor: "#E8F0FE",
    borderWidth: 1,
    borderColor: "#4285F4",
  },
  choiceText: { fontWeight: "700", color: "#111" },
  choiceTextActive: { color: "#111" },
});
