import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase, isSupabaseReady } from "@luffa/shared";

const TOPIC_PREFIX = "captain-pending-orders:";

let activeChannel: RealtimeChannel | null = null;
let activeUserId: string | null = null;
let onChangeHandler: (() => void) | null = null;
let subscriberCount = 0;
let setupPromise: Promise<void> | null = null;

function topicForUser(userId: string): string {
  return `${TOPIC_PREFIX}${userId}`;
}

function realtimeTopicForUser(userId: string): string {
  return `realtime:${topicForUser(userId)}`;
}

async function removeChannel(channel: RealtimeChannel): Promise<void> {
  if (!isSupabaseReady()) return;
  await getSupabase().removeChannel(channel);
}

async function purgeCaptainPendingChannels(userId: string): Promise<void> {
  if (!isSupabaseReady()) return;
  const supabase = getSupabase();
  const expectedTopic = realtimeTopicForUser(userId);
  const stale = supabase.getChannels().filter((ch) => ch.topic === expectedTopic);
  await Promise.all(stale.map((ch) => supabase.removeChannel(ch)));
  if (activeChannel && stale.some((ch) => ch === activeChannel)) {
    activeChannel = null;
    activeUserId = null;
  }
}

async function ensureCaptainPendingChannel(userId: string): Promise<void> {
  if (!isSupabaseReady()) return;
  if (activeChannel && activeUserId === userId) return;

  await purgeCaptainPendingChannels(userId);
  if (activeChannel && activeUserId === userId) return;

  const supabase = getSupabase();
  const channel = supabase
    .channel(topicForUser(userId))
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      () => {
        onChangeHandler?.();
      },
    )
    .subscribe();

  activeChannel = channel;
  activeUserId = userId;
}

/**
 * Single shared Realtime subscription for captain pending orders.
 * Safe across React Strict Mode remounts and duplicate hook instances.
 */
export function subscribeCaptainPendingOrders(userId: string, onChange: () => void): () => void {
  if (!isSupabaseReady() || !userId) return () => {};

  subscriberCount += 1;
  onChangeHandler = onChange;

  if (!activeChannel || activeUserId !== userId) {
    setupPromise = (setupPromise ?? Promise.resolve())
      .then(() => ensureCaptainPendingChannel(userId))
      .catch(() => {
        /* Realtime optional — polling still works */
      })
      .finally(() => {
        setupPromise = null;
      });
  }

  return () => {
    void unsubscribeCaptainPendingOrders();
  };
}

async function unsubscribeCaptainPendingOrders(): Promise<void> {
  subscriberCount = Math.max(0, subscriberCount - 1);
  if (subscriberCount > 0) return;

  if (setupPromise) {
    try {
      await setupPromise;
    } catch {
      /* ignore */
    }
  }

  onChangeHandler = null;
  const channel = activeChannel;
  activeChannel = null;
  activeUserId = null;
  if (channel) {
    await removeChannel(channel);
  }
}
