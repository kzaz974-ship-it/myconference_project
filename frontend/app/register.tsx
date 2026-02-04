import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://localhost/myconference_api/auth";

export default function Register() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ باش نشوفو الرد داخل الصفحة
  const [serverMsg, setServerMsg] = useState("");

  const handleRegister = async () => {
    setServerMsg("CLICKED ✅");

    if (!firstName || !lastName || !email || !affiliation || !country || !password || !retypePassword) {
      setServerMsg("❌ Missing fields");
      Alert.alert("Erreur", "Remplis tous les champs");
      return;
    }
    if (password !== retypePassword) {
      setServerMsg("❌ Passwords not matching");
      Alert.alert("Erreur", "Passwords not matching");
      return;
    }
    if (!agreeTerms) {
      setServerMsg("❌ Terms not accepted");
      Alert.alert("Erreur", "Accept terms");
      return;
    }

    setLoading(true);
    setServerMsg("Sending request...");

    try {
      const res = await fetch(`${API_URL}/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, affiliation, country }),
      });

      const text = await res.text(); // مهم باش نشوفو أي رد
      setServerMsg(`STATUS ${res.status}\n${text}`);

      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        Alert.alert("Erreur", "Response not JSON. Check serverMsg.");
        return;
      }

      if (data.success) {
        Alert.alert("Succès", "Compte créé ✅");
        router.replace("/login");
      } else {
        Alert.alert("Erreur", data.message || "Register failed");
      }
    } catch (e: any) {
      setServerMsg("❌ Fetch failed: " + String(e?.message ?? e));
      Alert.alert("Erreur", "Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>

        {/* ✅ الرسالة اللي كتورّينا واش الزر كيخدم وشنو رجع السيرفر */}
        {!!serverMsg && (
          <View style={styles.debugBox}>
            <Text style={styles.debugText}>{serverMsg}</Text>
          </View>
        )}

        <Text style={styles.label}>First name *</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

        <Text style={styles.label}>Last name *</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

        <Text style={styles.label}>Email *</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />

        <Text style={styles.label}>Affiliation *</Text>
        <TextInput style={styles.input} value={affiliation} onChangeText={setAffiliation} />

        <Text style={styles.label}>Country *</Text>
        <TextInput style={styles.input} value={country} onChangeText={setCountry} />

        <Text style={styles.label}>Password *</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

        <Text style={styles.label}>Retype password *</Text>
        <TextInput style={styles.input} value={retypePassword} onChangeText={setRetypePassword} secureTextEntry />

        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreeTerms(!agreeTerms)}>
          <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
            {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text>I agree to the Terms</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueBtn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.continueBtnText}>Continue</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  content: { padding: 20, paddingTop: 50 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 10 },

  debugBox: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 10, marginBottom: 15 },
  debugText: { fontSize: 12, color: "#333" },

  label: { marginBottom: 5, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, marginBottom: 15, backgroundColor: "#fff" },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginVertical: 15 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: "#ccc", marginRight: 10, alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: "#4285F4", borderColor: "#4285F4" },
  checkmark: { color: "#fff", fontWeight: "bold" },
  continueBtn: { backgroundColor: "#4285F4", padding: 15, borderRadius: 10, marginTop: 10 },
  continueBtnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
