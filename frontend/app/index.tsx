import { useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>MyConférence</Text>

        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push("/login" as any)}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* HERO CARD */}
      <View style={styles.heroCard}>
        <Text style={styles.title}>You chair a conference.</Text>
        <Text style={styles.subtitle}>We have all you need.</Text>

        <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push("/login" as any)}>
          <Text style={styles.btnPrimaryText}>Create a conference</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnOutline} onPress={() => router.push("/login" as any)}>
          <Text style={styles.btnOutlineText}>General questions</Text>
        </TouchableOpacity>
      </View>

      {/* IMAGE SECTION */}
      <ImageBackground
        
        source={require("../assets/images/conference.jpg")}
        style={styles.imageSection}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.overlay}>
          <Text style={styles.imageTitle}>Professional Conference Management</Text>
          <Text style={styles.imageSubtitle}>
            Organize submissions, reviewers and decisions easily
          </Text>
        </View>
      </ImageBackground>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },

  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  logo: { fontSize: 24, fontWeight: "bold", color: "#f4b400" },
  loginBtn: { backgroundColor: "#4285F4", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  loginText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  heroCard: {
    margin: 20,
    marginTop: 30,
    padding: 30,
    borderRadius: 20,
    backgroundColor: "#ffffff",
  },
  title: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: "#1a1a1a", marginBottom: 10 },
  subtitle: { fontSize: 18, textAlign: "center", marginVertical: 15, color: "#666" },

  btnPrimary: { backgroundColor: "#f4b400", padding: 16, borderRadius: 12, marginTop: 20 },
  btnPrimaryText: { textAlign: "center", fontWeight: "bold", fontSize: 17, color: "#1a1a1a" },

  btnOutline: { borderWidth: 2, borderColor: "#f4b400", padding: 16, borderRadius: 12, marginTop: 15 },
  btnOutlineText: { textAlign: "center", color: "#f4b400", fontWeight: "600", fontSize: 17 },

  imageSection: { height: 250, marginHorizontal: 20, marginTop: 30, justifyContent: "flex-end", overflow: "hidden" },
  overlay: { backgroundColor: "rgba(0,0,0,0.6)", padding: 20, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  imageTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  imageSubtitle: { color: "#e0e0e0", fontSize: 15, lineHeight: 22 },
});