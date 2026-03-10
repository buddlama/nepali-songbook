import { SongRenderProvider } from "@/components/song-render/context";
import { SongRenderControls } from "@/components/song-render/controls";
import { SongView } from "@/components/song-view";
import { Button } from "@/components/ui/Button";
import { Spacer } from "@/components/ui/layout";
import { UiText } from "@/components/ui/Text";
import { findAnySongById } from "@/lib/data/all-songs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SongDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [song, setSong] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (typeof id === "string") {
        const s = await findAnySongById(id);
        if (mounted) setSong(s ?? null);
      } else if (mounted) {
        setSong(null);
      }
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <UiText>Loading…</UiText>
      </SafeAreaView>
    );
  }

  if (!song) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <UiText variant="subtitle">Song not found.</UiText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <UiText variant="title">{song.title}</UiText>
          <Spacer size={1} />
          <UiText variant="caption">{song.artist}</UiText>
          <Spacer size={2} />
          <Button
            title="Edit Song"
            onPress={() => router.push(`/(tabs)/add?edit=${id}` as any)}
            variant="secondary"
          />
        </View>
        <SongRenderProvider>
          <SongRenderControls languages={Object.keys(song.lyricsByLang ?? {})} />
          <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
            <SongView song={song} />
          </View>
        </SongRenderProvider>
      </ScrollView>
    </SafeAreaView>
  );
}
