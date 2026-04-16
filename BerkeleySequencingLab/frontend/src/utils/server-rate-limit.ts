import { createAdminClient } from '@/utils/supabase/admin';

type RateLimitState = {
  attempts: number;
  resetAt: number;
};

type PersistentRateLimitRow = {
  attempts: number;
  reset_at: string;
};

type RateLimitStatus = {
  allowed: boolean;
  retryAfterMs: number;
};

export class ServerRateLimiter {
  private readonly attempts = new Map<string, RateLimitState>();

  constructor(
    private readonly maxAttempts: number,
    private readonly windowMs: number
  ) {}

  private getState(identifier: string) {
    const now = Date.now();
    const currentState = this.attempts.get(identifier);

    if (!currentState || currentState.resetAt <= now) {
      return {
        attempts: 0,
        resetAt: now + this.windowMs,
      };
    }

    return currentState;
  }

  private getPersistentClient() {
    return createAdminClient();
  }

  private async readPersistentState(identifier: string): Promise<RateLimitState | null> {
    const adminClient = this.getPersistentClient();
    if (!adminClient) {
      return null;
    }

    const { data, error } = await adminClient
      .from('auth_rate_limits')
      .select('attempts, reset_at')
      .eq('identifier', identifier)
      .maybeSingle<PersistentRateLimitRow>();

    if (error) {
      console.error('Failed to read auth rate limit state:', error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      attempts: data.attempts,
      resetAt: new Date(data.reset_at).getTime(),
    } satisfies RateLimitState;
  }

  private async writePersistentState(identifier: string, state: RateLimitState): Promise<void> {
    const adminClient = this.getPersistentClient();
    if (!adminClient) {
      return;
    }

    const { error } = await adminClient.from('auth_rate_limits').upsert(
      {
        identifier,
        attempts: state.attempts,
        reset_at: new Date(state.resetAt).toISOString(),
      },
      { onConflict: 'identifier' }
    );

    if (error) {
      console.error('Failed to write auth rate limit state:', error.message);
    }
  }

  private async deletePersistentState(identifier: string): Promise<void> {
    const adminClient = this.getPersistentClient();
    if (!adminClient) {
      return;
    }

    const { error } = await adminClient
      .from('auth_rate_limits')
      .delete()
      .eq('identifier', identifier);

    if (error) {
      console.error('Failed to clear auth rate limit state:', error.message);
    }
  }

  async getStatus(identifier: string): Promise<RateLimitStatus> {
    const persistentState = await this.readPersistentState(identifier);
    const state = persistentState ?? this.getState(identifier);
    const now = Date.now();

    if (state.attempts >= this.maxAttempts) {
      return {
        allowed: false,
        retryAfterMs: Math.max(0, state.resetAt - now),
      };
    }

    return {
      allowed: true,
      retryAfterMs: 0,
    };
  }

  async getAttemptCount(identifier: string): Promise<number> {
    const persistentState = await this.readPersistentState(identifier);
    const state = persistentState ?? this.getState(identifier);
    const now = Date.now();

    if (state.resetAt <= now) {
      return 0;
    }

    return state.attempts;
  }

  async recordFailure(identifier: string): Promise<RateLimitState> {
    const persistentState = await this.readPersistentState(identifier);
    const state = persistentState ?? this.getState(identifier);
    const now = Date.now();
    const normalizedState = state.resetAt <= now
      ? {
          attempts: 0,
          resetAt: now + this.windowMs,
        }
      : state;

    const nextState = {
      attempts: normalizedState.attempts + 1,
      resetAt: normalizedState.resetAt,
    };

    this.attempts.set(identifier, nextState);
    await this.writePersistentState(identifier, nextState);
    return nextState;
  }

  async reset(identifier: string): Promise<void> {
    this.attempts.delete(identifier);
    await this.deletePersistentState(identifier);
  }

  clearAll() {
    this.attempts.clear();
  }
}

export const loginServerRateLimiter = new ServerRateLimiter(5, 15 * 60 * 1000);

export function formatRetryDelay(retryAfterMs: number) {
  const minutes = Math.ceil(retryAfterMs / 60000);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}
