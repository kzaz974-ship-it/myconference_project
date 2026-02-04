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
        <TouchableOpacity 
          style={styles.loginBtn}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* HERO CARD */}
      <View style={styles.heroCard}>
        <Text style={styles.title}>You chair a conference.</Text>
        <Text style={styles.subtitle}>We have all you need.</Text>

        <TouchableOpacity style={styles.btnPrimary}>
          <Text style={styles.btnPrimaryText}>Create a conference</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnOutline}>
          <Text style={styles.btnOutlineText}>General questions</Text>
        </TouchableOpacity>
      </View>

      {/* FEATURES SECTION */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Why Choose MyConférence?</Text>
        
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📝</Text>
            <Text style={styles.featureTitle}>Easy Submission</Text>
            <Text style={styles.featureText}>Streamlined paper submission process</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureTitle}>Reviewer Management</Text>
            <Text style={styles.featureText}>Assign and track reviewers efficiently</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureTitle}>Decision Tracking</Text>
            <Text style={styles.featureText}>Monitor all decisions in one place</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureTitle}>Secure Platform</Text>
            <Text style={styles.featureText}>Your data is safe and encrypted</Text>
          </View>
        </View>
      </View>

      {/* IMAGE SECTION */}
      <ImageBackground
        source={require("../assets/images/conference.jpg")}
        style={styles.imageSection}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.overlay}>
          <Text style={styles.imageTitle}>
            Professional Conference Management
          </Text>
          <Text style={styles.imageSubtitle}>
            Organize submissions, reviewers and decisions easily
          </Text>
        </View>
      </ImageBackground>

      {/* STATS SECTION */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>500+</Text>
          <Text style={styles.statLabel}>Conferences</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>10K+</Text>
          <Text style={styles.statLabel}>Papers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>50K+</Text>
          <Text style={styles.statLabel}>Users</Text>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 MyConférence. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },

  /* HEADER */
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f4b400",
  },
  loginBtn: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#4285F4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  loginText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  /* HERO */
  heroCard: {
    margin: 20,
    marginTop: 30,
    padding: 30,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 15,
    color: "#666",
    lineHeight: 24,
  },
  btnPrimary: {
    backgroundColor: "#f4b400",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: "#f4b400",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
    color: "#1a1a1a",
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: "#f4b400",
    padding: 16,
    borderRadius: 12,
    marginTop: 15,
    backgroundColor: "transparent",
  },
  btnOutlineText: {
    textAlign: "center",
    color: "#f4b400",
    fontWeight: "600",
    fontSize: 17,
  },

  /* FEATURES */
  featuresSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#1a1a1a",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#1a1a1a",
  },
  featureText: {
    fontSize: 13,
    textAlign: "center",
    color: "#666",
    lineHeight: 18,
  },

  /* IMAGE */
  imageSection: {
    height: 250,
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  imageTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  imageSubtitle: {
    color: "#e0e0e0",
    fontSize: 15,
    lineHeight: 22,
  },

  /* STATS */
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f4b400",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },

  /* FOOTER */
  footer: {
    backgroundColor: "#1a1a1a",
    padding: 25,
    alignItems: "center",
  },
  footerText: {
    color: "#999",
    fontSize: 13,
  },
});