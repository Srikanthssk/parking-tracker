import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack initialRouteName="splash">
        <Stack.Screen
          name="splash"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="park-details"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="map"
          options={{ headerShown: false }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}