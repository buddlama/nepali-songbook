import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { VStack } from "@/components/ui/layout";
import { useThemeColor } from "@/hooks/use-theme-color";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const border = useThemeColor({}, "icon");

  async function onLogin() {
    if (!supabase) return;

    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
        return;
      }

      router.replace("/(tabs)/songs");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
        >
          <VStack space={2}>
            <ThemedText type="title">Welcome Back</ThemedText>
            <ThemedText>Sign in to continue to your private songbook.</ThemedText>

            {!isSupabaseConfigured ? (
              <ThemedText>
                Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your env file.
              </ThemedText>
            ) : (
              <>
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={{
                    backgroundColor: bg as string,
                    borderColor: border as string,
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: text as string,
                  }}
                  placeholderTextColor={border as string}
                />
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  style={{
                    backgroundColor: bg as string,
                    borderColor: border as string,
                    borderWidth: 1,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: text as string,
                  }}
                  placeholderTextColor={border as string}
                />
                <Button title="Login" onPress={onLogin} loading={loading} disabled={loading} />
                <Link href="/signup" asChild>
                  <Button title="Create Account" variant="secondary" />
                </Link>
              </>
            )}
          </VStack>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
