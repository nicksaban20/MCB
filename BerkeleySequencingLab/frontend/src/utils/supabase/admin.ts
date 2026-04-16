import 'server-only';

import { createClient } from '@supabase/supabase-js';

let cachedAdminClient: ReturnType<typeof createClient> | null | undefined;

export function createAdminClient() {
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  if (cachedAdminClient !== undefined) {
    return cachedAdminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in production for server-side rate limiting.');
    }

    cachedAdminClient = null;
    return cachedAdminClient;
  }

  cachedAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedAdminClient;
}
