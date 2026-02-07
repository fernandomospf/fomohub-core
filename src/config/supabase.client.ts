import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(
  accessToken: string,
  supabaseUrl: string,
  supabaseKey: string,
) {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
