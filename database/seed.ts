import bundledSongs from "@/assets/data/songs.json";
import type { Song } from "@/types/song";
import { db } from ".";
import { userSongsTable } from "./schema";

type SeedSong = {
  id: string;
  title: string;
  artist: string;
  tags?: string[];
  lines?: string[];
  key?: string | null;
  capo?: number | null;
};

// Map bundled songs from songs.json into seedable format
export const seedSongs: SeedSong[] = bundledSongs.map((song: Song) => ({
  id: song.id,
  title: song.title,
  artist: song.artist,
  tags: song.tags,
  lines: song.lines,
  key: song.key || null,
  capo: song.capo || 0,
}));

export async function runSeeds() {
  // Insert seed songs from songs.json
  for (const s of seedSongs) {
    try {
      await db.insert(userSongsTable).values({
        id: s.id,
        title: s.title,
        artist: s.artist,
        key: s.key || null,
        capo: s.capo || 0,
        bpm: null as any,
        tags: (s.tags ?? []).join(","),
        lines: (s.lines ?? []).join("\n"),
      } as any);
    } catch {
      // ignore duplicates or insert errors in seed
    }
  }
}
