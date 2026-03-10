import { ArtistsAccordion, type ArtistGroup } from "@/components/artists-accordion";
import { SearchBar } from "@/components/search-bar";
import { SongList } from "@/components/song-list";
import { ThemedView } from "@/components/themed-view";
import { UiText } from "@/components/ui/Text";
import { getAllSongs } from "@/lib/data/all-songs";
import { useFavorites } from "@/lib/storage/favorites";
import type { Song } from "@/types/song";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SongsScreen() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSongs = React.useCallback(async () => {
    const all = await getAllSongs();
    setSongs(all);
  }, []);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchSongs();
    } finally {
      setRefreshing(false);
    }
  }, [fetchSongs]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await getAllSongs();
      if (mounted) setSongs(all);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchSongs();
    }, [fetchSongs])
  );

  const [mode, setMode] = useState<"all" | "artists">("all");
  const [term, setTerm] = useState("");
  const fav = useFavorites();

  const songsFiltered = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return songs;
    return songs.filter(s => {
      const inTitle = s.title.toLowerCase().includes(t);
      const inArtist = s.artist.toLowerCase().includes(t);
      const inTags = s.tags?.some(x => x.toLowerCase().includes(t));
      return inTitle || inArtist || inTags;
    });
  }, [songs, term]);

  const artistGroups: ArtistGroup[] = useMemo(() => {
    const map = new Map<string, Song[]>();
    for (const s of songs) {
      const arr = map.get(s.artist) ?? [];
      arr.push(s);
      map.set(s.artist, arr);
    }
    return Array.from(map.entries())
      .map(([name, list]) => ({ name, songs: list }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [songs]);

  const artistGroupsFiltered: ArtistGroup[] = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return artistGroups;
    return artistGroups.filter(g => g.name.toLowerCase().includes(t));
  }, [artistGroups, term]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ThemedView>
          <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
            <UiText variant="title">{mode === "all" ? "Songs" : "Artists"}</UiText>
          </View>
          <Animated.View>
            <SearchBar value={term} onChange={setTerm} onClear={() => setTerm("")} />
            <View
              style={{
                paddingHorizontal: 16,
                paddingBottom: 8,
                flexDirection: "row",
              }}
            >
              <Segmented
                value={mode}
                onChange={next => setMode(next as any)}
                options={[
                  { key: "all", label: "ALL" },
                  { key: "artists", label: "ARTISTS" },
                ]}
              />
            </View>
          </Animated.View>

          {mode === "all" ? (
            <SongList
              songs={songsFiltered}
              // Cast to any to avoid TS path union issues when expo-router typegen isn't active in tsc
              onPressItem={song => router.push(`/song/${song.id}` as any)}
              isFavorite={id => fav.isFavorite(id)}
              onToggleFavorite={id => fav.toggleFavorite(id)}
              onDelete={fetchSongs}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          ) : (
            <ArtistsAccordion
              items={artistGroupsFiltered}
              onPressSong={song => router.push(`/song/${song.id}` as any)}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          )}
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <View style={{ flexDirection: "row" }}>
      {options.map((opt, idx) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(opt.key)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: active ? "#0ea5e9" : "#e5e7eb",
              backgroundColor: active ? "#0ea5e920" : "transparent",
              borderTopLeftRadius: idx === 0 ? 8 : 0,
              borderBottomLeftRadius: idx === 0 ? 8 : 0,
              borderTopRightRadius: idx === options.length - 1 ? 8 : 0,
              borderBottomRightRadius: idx === options.length - 1 ? 8 : 0,
              marginRight: idx < options.length - 1 ? 4 : 0,
            }}
          >
            <UiText>{opt.label}</UiText>
          </Pressable>
        );
      })}
    </View>
  );
}
