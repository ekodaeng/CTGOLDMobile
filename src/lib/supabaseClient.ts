import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

function getEnv(key: string): string | undefined {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key];
    }
  } catch {}

  try {
    if (typeof process !== 'undefined' && process.env) {
      return (process.env as any)[key];
    }
  } catch {}

  return undefined;
}

const supabaseUrl =
  getEnv('VITE_SUPABASE_URL') ||
  getEnv('NEXT_PUBLIC_SUPABASE_URL') ||
  getEnv('SUPABASE_URL');

const supabaseAnonKey =
  getEnv('VITE_SUPABASE_ANON_KEY') ||
  getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  getEnv('SUPABASE_ANON_KEY');

export const SUPABASE_ENV_STATUS = {
  urlPresent: !!supabaseUrl,
  anonPresent: !!supabaseAnonKey,
  urlValue: supabaseUrl || '',
  urlPreview: supabaseUrl ? String(supabaseUrl).slice(0, 40) + '...' : '(not set)',
  anonPreview: supabaseAnonKey ? String(supabaseAnonKey).slice(0, 20) + '...' : '(not set)',
};

console.log('🔍 Supabase ENV Check:');
console.log('  URL Present:', SUPABASE_ENV_STATUS.urlPresent);
console.log('  URL Preview:', SUPABASE_ENV_STATUS.urlPreview);
console.log('  Anon Key Present:', SUPABASE_ENV_STATUS.anonPresent);
console.log('  Anon Key Preview:', SUPABASE_ENV_STATUS.anonPreview);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase ENV MISSING!');
  console.error('   Expected: VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('   Expected: VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('   Check your .env file and restart dev server!');
}

let supabaseInstance: SupabaseClient<Database> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'ctgold-auth',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'pkce',
      },
    });
    console.log('✅ Supabase client initialized');
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
  }
} else {
  console.warn('⚠️  Supabase client NOT initialized (missing env variables)');
}

export const supabase = supabaseInstance!;
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

export async function getSessionSafe() {
  if (!supabaseInstance) {
    console.error('[getSessionSafe] Supabase client not initialized');
    return { session: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabaseInstance.auth.getSession();
    if (error) {
      console.error('[getSessionSafe] Error:', error.message);
      return { session: null, error: error.message };
    }
    return { session: data.session, error: null };
  } catch (err) {
    console.error('[getSessionSafe] Exception:', err);
    return { session: null, error: String(err) };
  }
}
