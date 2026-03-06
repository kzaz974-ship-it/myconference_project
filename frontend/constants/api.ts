import { Platform } from "react-native";

const LAN_IP = "10.160.9.140";

export const API_URL =
  Platform.OS === "web"
    ? "http://localhost:8080/myconference_project/backend"
    : `http://${LAN_IP}:8080/myconference_project/backend`;