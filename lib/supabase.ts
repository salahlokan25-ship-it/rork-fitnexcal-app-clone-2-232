import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { EXPO_PUBLIC_SUPABASE_URL as FILE_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY as FILE_SUPABASE_ANON_KEY } from "./env";

// Read from local file first, then Expo public envs
const SUPABASE_URL = (FILE_SUPABASE_URL || (process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined));
const SUPABASE_ANON_KEY = (FILE_SUPABASE_ANON_KEY || (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined));

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Do not throw at import time in development preview; allow app to boot
  // Consumers should guard supabase usage when envs are missing
  console.warn(
    "Supabase env not set. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable persistence."
  );
}

export const supabase = createClient(
  SUPABASE_URL ?? "http://localhost:54321", // placeholder
  SUPABASE_ANON_KEY ?? "public-anon-key", // placeholder
  {
    auth: {
      storage: AsyncStorage as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Basic auth helpers
export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}
