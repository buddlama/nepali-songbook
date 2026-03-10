import { LoadingScreen } from "@/components/loading-screen";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { VStack } from "@/components/ui/layout";
import { db } from "@/database";
import { runSeeds } from "@/database/seed";
import { exportSongsCSV, importSongsCSV } from "@/lib/db";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useEffect, useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { userSongsTable, usersTable } from "../../database/schema";
import migrations from "../../drizzle/migrations";

export default function DatabaseView() {
  const { success, error } = useMigrations(db, migrations);
  const [items, setItems] = useState<(typeof usersTable.$inferSelect)[] | null>([]);
  const nameRef = useRef<TextInput>(null);
  const ageRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const [userForm, setUserForm] = useState({ name: "", age: "", email: "" });

  // Loading states for each button
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  useEffect(() => {
    if (!success) return;

    (async () => {
      // await db.delete(usersTable);
      // await db.insert(usersTable).values([
      //   {
      //     name: "John",
      //     age: 30,
      //     email: "john@example.com",
      //   },
      // ]);
      // const users = await db.select().from(usersTable);
      // Run seed data for user_songs after migrations
      // await runSeeds();
    })();
  }, [success]);

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
        <ScrollView contentContainerStyle={{ flex: 1 }}>
          <ThemedView
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              height: "100%",
              justifyContent: "center",
            }}
          >
            <VStack space={2}>
              {/* <Button
            title="Export DB"
            onPress={() => {
              exportDB();
            }}
          /> */}
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

              {/* <Button
            title="Clear Songs"
            onPress={e => {
              e.stopPropagation();
              clearSongsTable();
            }}
          /> */}
            </VStack>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
