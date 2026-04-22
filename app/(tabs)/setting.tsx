import { LoadingScreen } from "@/components/loading-screen";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { VStack } from "@/components/ui/layout";
import { db } from "@/database";
import { runSeeds } from "@/database/seed";
import { useThemeColor } from "@/hooks/use-theme-color";
import { exportSongsCSV, importSongsCSV } from "@/lib/db";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { userSongsTable } from "../../database/schema";
import migrations from "../../drizzle/migrations";

export default function DatabaseView() {
  const { success, error } = useMigrations(db, migrations);

  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const text = useThemeColor({}, "text");

  useEffect(() => {
    if (!success) return;
  }, [success]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    if (!supabase) return;

    setAuthLoading(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        Alert.alert("Sign Out Failed", signOutError.message);
      }
    } finally {
      setAuthLoading(false);
    }
  }

  if (error) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <ThemedText type="title" style={{ marginBottom: 16, color: "#ef4444" }}>
              Migration Error
            </ThemedText>
            <ThemedText style={{ textAlign: "center" }}>{error.message}</ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!success) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <LoadingScreen message="Setting up database..." subtitle="Running migrations" />
      </SafeAreaView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <ThemedView style={{ marginBottom: 20 }}>
            <ThemedText type="title" style={{ marginBottom: 12 }}>
              Account
            </ThemedText>
            {!isSupabaseConfigured ? (
              <ThemedText>
                Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your env to enable
                auth.
              </ThemedText>
            ) : (
              <VStack space={2}>
                <ThemedText style={{ color: text as string }}>
                  {session?.user?.email ? `Signed in as ${session.user.email}` : "Not signed in"}
                </ThemedText>
                <Button
                  title="Sign Out"
                  onPress={handleSignOut}
                  loading={authLoading}
                  disabled={authLoading || !session}
                  variant="ghost"
                />
              </VStack>
            )}
          </ThemedView>

          <ThemedView>
            <ThemedText type="title" style={{ marginBottom: 12 }}>
              Data Tools
            </ThemedText>
            <VStack space={2}>
              <Button
                title="Export Songs CSV"
                loading={exportLoading}
                disabled={exportLoading}
                onPress={async () => {
                  setExportLoading(true);
                  try {
                    await exportSongsCSV();
                  } finally {
                    setExportLoading(false);
                  }
                }}
              />
              <Button
                title="Import CSV Data"
                loading={importLoading}
                disabled={importLoading}
                onPress={async e => {
                  e.stopPropagation();
                  setImportLoading(true);
                  try {
                    await importSongsCSV();
                  } finally {
                    setImportLoading(false);
                  }
                }}
              />
              <Button
                title="Run Seeds"
                loading={seedLoading}
                disabled={seedLoading}
                onPress={async () => {
                  setSeedLoading(true);
                  try {
                    await db.delete(userSongsTable);
                    await runSeeds();
                  } finally {
                    setSeedLoading(false);
                  }
                }}
              />
            </VStack>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
