declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** Feature flag to enable stubbed online search screen (client-only). */
      EXPO_PUBLIC_SEARCH_ONLINE?: string;
      /** Google Custom Search API key (client-only dev; prefer server) */
      EXPO_PUBLIC_GOOGLE_CSE_KEY?: string;
      /** Google Custom Search Engine ID (cx) */
      EXPO_PUBLIC_GOOGLE_CSE_CX?: string;
      /** Comma-separated list of sites to search (e.g., "example.com,foo.org,bar.net") */
      EXPO_PUBLIC_SEARCH_SITES?: string;
      /** Supabase project URL (public) */
      EXPO_PUBLIC_SUPABASE_URL?: string;
      /** Supabase anon key (public) */
      EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    }
  }
}

export {};
