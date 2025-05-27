import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ForceUpdatePopup from "@/components/ForceUpdatePopup";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        {/* <ForceUpdatePopup /> */}
        {/* Stack with all screens */}
        <Stack
          screenOptions={{
            headerShown: false, // Hide default headers
            // header: () => <CustomHeader />,
          }}
        />
        {/* Status bar configuration */}
        <StatusBar style="dark" backgroundColor="#ffffff" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
