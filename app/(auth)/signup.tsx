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

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const border = useThemeColor({}, "icon");

  async function onSignup() {
    if (!supabase) return;

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak password", "Password should be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert("Sign Up Failed", error.message);
        return;
      }

      Alert.alert(
        "Account Created",
        "If email confirmation is enabled, please verify your email before login."
      );
      router.replace("/login");
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
            <ThemedText type="title">Create Account</ThemedText>
            <ThemedText>Set up your private account for sync.</ThemedText>

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
                <TextInput
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
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
                <Button
                  title="Create Account"
                  onPress={onSignup}
                  loading={loading}
                  disabled={loading}
                />
                <Link href="/login" asChild>
                  <Button title="Back to Login" variant="ghost" />
                </Link>
              </>
            )}
          </VStack>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
