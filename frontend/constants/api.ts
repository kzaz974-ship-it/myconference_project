import { Platform } from "react-native";

const LAN_IP = "192.168.1.146"; // بدّليه ل IP ديال PC ديالك

export const API_URL =
  Platform.OS === "web"
    ? "http://localhost:8080/myconference_project/backend"
    : `http://${LAN_IP}:8080/myconference_project/backend`;



