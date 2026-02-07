import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

type LoginResponse =
  | { success: true; user: any }
  | { success: false; message?: string; error?: any };

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Debug box
  const [debugMsg, setDebugMsg] = useState("");

  const handleLogin = async () => {
    setDebugMsg("CLICKED ✅");

    if (!email || !password) {
      setDebugMsg("❌ Missing email/password");
      Alert.alert("Erreur", "Remplis email et mot de passe");
      return;
    }

    setLoading(true);
    setDebugMsg("Sending request...");

    try {
      // ✅ IMPORTANT: login is in /auth/login.php
      const res = await fetch(`${API_URL}/auth/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      setDebugMsg(`STATUS ${res.status}\n${text}`);

      let data: LoginResponse | null = null;
      try {
        data = JSON.parse(text);
      } catch {
        Alert.alert("Erreur", "Response not JSON. Check debug box.");
        return;
      }

      if (data && data.success) {
        await AsyncStorage.setItem("user", JSON.stringify((data as any).user));
        Alert.alert("Succès", "Login réussi ✅");

        // ✅ Redirect
        router.replace("/dashboard" as any);
      } else {
        Alert.alert("Erreur", (data as any)?.message || "Login failed");
      }
    } catch (e: any) {
      setDebugMsg("❌ Fetch failed: " + String(e?.message ?? e));
      Alert.alert("Erreur", "Fetch failed (server unreachable?)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {!!debugMsg && (
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>{debugMsg}</Text>
        </View>
      )}

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="exemple@email.com"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
      />

      <TouchableOpacity
        style={styles.loginBtn}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginBtnText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createAccountBtn}
        onPress={() => router.push("/register" as any)}
      >
        <Text style={styles.createAccountText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f7fa",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1a1a1a",
  },

  debugBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  debugText: { fontSize: 12, color: "#333" },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: "#4285F4",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  loginBtnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "bold",
  },
  createAccountBtn: {
    borderWidth: 2,
    borderColor: "#f4b400",
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginTop: 20,
  },
  createAccountText: {
    color: "#f4b400",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "bold",
  },
});