import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Register" }} />
      <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Stack.Screen name="chair/index" options={{ title: "Organizer" }} />
      <Stack.Screen name="chair/create-conference" options={{ title: "Create Conference" }} />
      <Stack.Screen name="chair/conf/[id]" options={{ title: "Manage Conference" }} />
    </Stack>
  );
}