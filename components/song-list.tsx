import { SongItem } from "@/components/song-item";
import { Spacer } from "@/components/ui/layout/spacer";
import { UiText } from "@/components/ui/Text";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { Song } from "@/types/song";
import React from "react";
import { FlatList, RefreshControl, View } from "react-native";

export type SongListProps = {
  songs: Song[];
  onPressItem?: (song: Song) => void;
  isFavorite?: (id: string) => boolean;
  onToggleFavorite?: (id: string, next: boolean) => void;
  onDelete?: (song: Song) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function SongList({
  songs,
  onPressItem,
  isFavorite,
  onToggleFavorite,
  onDelete,
  refreshing = false,
  onRefresh,
}: SongListProps) {
  const tintColor = useThemeColor({}, "tint");
  if (!songs || songs.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <UiText>Nothing to show yet.</UiText>
      </View>
    );
  }

  return (
    <FlatList
      data={songs}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={() => <Spacer size={2} />}
      renderItem={({ item }) => (
        <SongItem
          song={item}
          onPress={onPressItem}
          isFavorite={isFavorite?.(item.id)}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
        />
      )}
      contentContainerStyle={{ paddingVertical: 8, paddingBottom: 100 }}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tintColor}
            colors={[tintColor]}
          />
        ) : undefined
      }
    />
  );
}
