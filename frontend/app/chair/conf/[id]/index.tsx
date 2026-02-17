import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ManageConference() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Manage Conference</Text>
      <Text style={styles.sub}>Conference ID: {id}</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push(`/chair/conf/${id}/submissions` as any)}
      >
        <Text style={styles.btnText}>📄 Submissions</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push(`/chair/conf/${id}/assign` as any)}
      >
        <Text style={styles.btnText}>👩‍⚖️ Assign Reviewers</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push(`/chair/conf/${id}/reviews` as any)}
      >
        <Text style={styles.btnText}>⭐ Reviews & Decision</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.backBtn]} onPress={() => router.back()}>
        <Text style={[styles.btnText, { color: "#111" }]}>⬅️ Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 16 },
  title: { fontSize: 22, fontWeight: "900" },
  sub: { color: "#666", marginTop: 6, marginBottom: 16 },
  btn: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee", padding: 16, borderRadius: 16, marginTop: 12 },
  btnText: { fontWeight: "900", color: "#111" },
  backBtn: { backgroundColor: "#fff", borderColor: "#111" },
});
