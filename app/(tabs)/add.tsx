import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { Stack } from "@/components/ui/layout/stack";
import { UiText } from "@/components/ui/Text";
import { Radius, Typography } from "@/constants/tokens";
import { db } from "@/database";
import { userSongsTable } from "@/database/schema";
import { useThemeColor } from "@/hooks/use-theme-color";
import { normalizeChordMarkup, parseChordNotation } from "@/lib/chords/chord-parser";
import { clearImportDraft, getImportDraft } from "@/lib/storage/import-draft";
import { makeUserSongId } from "@/lib/storage/user-songs";
import type { Song } from "@/types/song";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddSongScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ draft?: string; edit?: string }>();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [keyText, setKeyText] = useState("");
  const [capoText, setCapoText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [linesText, setLinesText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);

  const isEditMode = !!params?.edit;

  // Prefill from import draft or load song for editing
  const prefilledRef = useRef(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Load song for editing
      if (params?.edit && !prefilledRef.current) {
        const { findAnySongById } = await import("@/lib/data/all-songs");
        const song = await findAnySongById(params.edit);
        if (mounted && song) {
          setTitle(song.title);
          setArtist(song.artist);
          setKeyText(song.key || "");
          setCapoText(song.capo?.toString() || "");
          setTagsText((song.tags || []).join(", "));
          setLinesText((song.lines || []).join("\n"));
          setEditingSongId(song.id);
          prefilledRef.current = true;
        }
      }
      // Or prefill from import draft
      else if (params?.draft && !prefilledRef.current) {
        const draft = await getImportDraft();
        if (mounted && draft) {
          if (!title) setTitle(draft.title);
          if (!artist) setArtist(draft.artist);
          if (!keyText && draft.key) setKeyText(draft.key);
          if (!linesText) setLinesText(draft.lines.join("\n"));
          await clearImportDraft();
          prefilledRef.current = true;
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params?.draft, params?.edit, title, artist, keyText, linesText]);

  const valid = useMemo(() => {
    return title.trim().length > 0 && artist.trim().length > 0 && linesText.trim().length > 0;
  }, [title, artist, linesText]);

  const hasData = useMemo(() => {
    return (
      title.trim().length > 0 ||
      artist.trim().length > 0 ||
      keyText.trim().length > 0 ||
      capoText.trim().length > 0 ||
      tagsText.trim().length > 0 ||
      linesText.trim().length > 0
    );
  }, [title, artist, keyText, capoText, tagsText, linesText]);

  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const border = useThemeColor({}, "icon");

  function onParse() {
    try {
      const parsed = parseChordNotation(linesText);
      const normalized = normalizeChordMarkup(parsed);
      setLinesText(normalized.join("\n"));
      Alert.alert("Parsed", "Chords have been parsed into the app format!");
    } catch (e) {
      console.warn(e);
      Alert.alert("Parse Error", "Failed to parse chords. Please check the format.");
    }
  }

  function onReset() {
    Alert.alert("Clear Form", "Are you sure you want to clear all fields?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setTitle("");
          setArtist("");
          setKeyText("");
          setCapoText("");
          setTagsText("");
          setLinesText("");
          if (isEditMode) {
            router.back();
          }
        },
      },
    ]);
  }

  async function onSave() {
    if (!valid) return;
    setSaving(true);
    try {
      const id = isEditMode && editingSongId ? editingSongId : makeUserSongId();
      const tags = tagsText
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);
      const lines = linesText.split(/\r?\n/).map(l => l.replace(/\s+$/g, ""));
      const capo = capoText.trim() ? parseInt(capoText.trim(), 10) : undefined;
      const song: Song = {
        id,
        title: title.trim(),
        artist: artist.trim(),
        key: keyText.trim() || undefined,
        capo: Number.isFinite(capo as any) ? (capo as number) : undefined,
        bpm: undefined,
        tags,
        lines,
      };

      // Persist to SQLite via Drizzle
      try {
        if (isEditMode && editingSongId) {
          // Update existing song
          const { eq } = await import("drizzle-orm");
          await db
            .update(userSongsTable)
            .set({
              title: song.title,
              artist: song.artist,
              key: song.key ?? (null as any),
              capo: song.capo ?? (null as any),
              bpm: song.bpm ?? (null as any),
              tags: (song.tags ?? []).join(","),
              lines: (song.lines ?? []).join("\n"),
            })
            .where(eq(userSongsTable.id, editingSongId));
        } else {
          // Insert new song
          await db.insert(userSongsTable).values({
            id: song.id,
            title: song.title,
            artist: song.artist,
            key: song.key ?? (null as any),
            capo: song.capo ?? (null as any),
            bpm: song.bpm ?? (null as any),
            tags: (song.tags ?? []).join(","),
            lines: (song.lines ?? []).join("\n"),
          } as any);
        }
      } catch (dbErr) {
        console.warn("DB operation failed:", dbErr);
        Alert.alert("Error", "Failed to save song to database.");
        setSaving(false);
        return;
      }

      Alert.alert(
        "Saved",
        isEditMode ? "Your song has been updated." : "Your song was added to the library.",
        [
          {
            text: "View",
            onPress: () => router.push(`/song/${song.id}` as any),
          },
          { text: "OK", onPress: () => router.back() },
        ]
      );

      // Reset form only if adding (not editing)
      if (!isEditMode) {
        setTitle("");
        setArtist("");
        setKeyText("");
        setCapoText("");
        setTagsText("");
        setLinesText("");
      }
    } catch (e) {
      console.warn(e);
      Alert.alert("Error", "Failed to save song. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <UiText variant="title">{isEditMode ? "Edit Song" : "Add Song"}</UiText>
          <View style={{ height: 12 }} />
          <Field label="Title">
            <TextInput
              placeholder="Eg. Hey Jude"
              value={title}
              onChangeText={setTitle}
              style={inputStyle(bg as string, border as string, text as string)}
              placeholderTextColor={border as string}
            />
          </Field>
          <Field label="Artist">
            <TextInput
              placeholder="Eg. The Beatles"
              value={artist}
              onChangeText={setArtist}
              style={inputStyle(bg as string, border as string, text as string)}
              placeholderTextColor={border as string}
            />
          </Field>
          <Stack direction="row" space={2}>
            <Field label="Key" style={{ flex: 1 }}>
              <TextInput
                placeholder="Eg. C or Gm"
                value={keyText}
                onChangeText={setKeyText}
                autoCapitalize="characters"
                style={inputStyle(bg as string, border as string, text as string)}
                placeholderTextColor={border as string}
              />
            </Field>
            <Field label="Capo" style={{ width: 100 }}>
              <TextInput
                placeholder="0"
                value={capoText}
                onChangeText={setCapoText}
                keyboardType="number-pad"
                style={inputStyle(bg as string, border as string, text as string)}
                placeholderTextColor={border as string}
              />
            </Field>
          </Stack>
          <Field label="Tags (comma separated)">
            <TextInput
              placeholder="worship, easy, nepali"
              value={tagsText}
              onChangeText={setTagsText}
              style={inputStyle(bg as string, border as string, text as string)}
              placeholderTextColor={border as string}
            />
          </Field>
          <Field label="Lyrics + Chords">
            <TextInput
              placeholder={`Paste chords/lyrics from anywhere!\nThen tap "Parse Chords" to convert.`}
              value={linesText}
              onChangeText={setLinesText}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              style={[
                inputStyle(bg as string, border as string, text as string),
                { minHeight: 160 },
              ]}
              placeholderTextColor={border as string}
            />
          </Field>
          <View style={{ height: 12 }} />
          <Stack direction="row" space={2}>
            {hasData && (
              <Button
                title={isEditMode ? "Cancel" : "Reset"}
                onPress={onReset}
                variant="ghost"
                style={{ flex: 1 }}
              />
            )}
            <Button
              title="Parse Chords"
              onPress={onParse}
              disabled={!linesText.trim()}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <Button
              title="Save"
              onPress={onSave}
              disabled={!valid || saving}
              loading={saving}
              style={{ flex: 1 }}
            />
          </Stack>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={style}>
      <UiText variant="caption" style={{ marginBottom: 6 }}>
        {label}
      </UiText>
      {children}
    </View>
  );
}

function inputStyle(bg: string, border: string, text: string) {
  return {
    backgroundColor: bg,
    borderColor: border,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: text,
    fontSize: Typography.sizes.base,
  } as const;
}
