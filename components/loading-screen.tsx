import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ActivityIndicator, View, ViewStyle } from "react-native";

export type LoadingScreenProps = {
  message?: string;
  subtitle?: string;
  size?: "small" | "large";
  style?: ViewStyle;
};

export function LoadingScreen({
  message = "Loading...",
  subtitle,
  size = "large",
  style,
}: LoadingScreenProps) {
  const spinnerColor = useThemeColor({}, "tint");

  return (
    <ThemedView style={[{ flex: 1 }, style]}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          padding: 20,
        }}
      >
        <ActivityIndicator size={size} color={spinnerColor} />
        <ThemedText type="subtitle" style={{ textAlign: "center" }}>
          {message}
        </ThemedText>
        {subtitle && (
          <ThemedText style={{ opacity: 0.7, textAlign: "center" }}>{subtitle}</ThemedText>
        )}
      </View>
    </ThemedView>
  );
}
