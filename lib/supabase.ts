import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// TODO: move to secure config/env before release
const SUPABASE_URL = 'https://wgecvckucgliumsaovwm.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZWN2Y2t1Y2dsaXVtc2FvdndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MjY3ODQsImV4cCI6MjA4MDEwMjc4NH0.5pgkwYck-xrOQ9RrBTp2vCRBYQNW4eD428PoF39gTrs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
