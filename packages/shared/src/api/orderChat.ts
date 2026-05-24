import type { Database } from "../supabase/database.types";
import { getSupabase, isSupabaseReady } from "../supabase/client";

type MessageRow = Database["public"]["Tables"]["order_messages"]["Row"];

export type OrderChatMessage = {
  id: string;
  orderId: string;
  senderId: string;
  body: string;
  createdAt: string;
  /** UI role: messages from the current user are "user". */
  role: "user" | "peer";
  time: string;
};

function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function mapRow(row: MessageRow, currentUserId: string): OrderChatMessage {
  return {
    id: row.id,
    orderId: row.order_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
    role: row.sender_id === currentUserId ? "user" : "peer",
    time: formatMessageTime(row.created_at),
  };
}

async function currentUserId(): Promise<string | null> {
  const { data } = await getSupabase().auth.getUser();
  return data.user?.id ?? null;
}

export async function fetchOrderMessages(orderId: string): Promise<OrderChatMessage[]> {
  if (!isSupabaseReady()) return [];
  const uid = await currentUserId();
  if (!uid) return [];

  const { data, error } = await getSupabase()
    .from("order_messages")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error || !data?.length) return [];
  return (data as MessageRow[]).map((row) => mapRow(row, uid));
}

export async function sendOrderMessage(orderId: string, body: string): Promise<OrderChatMessage | null> {
  if (!isSupabaseReady()) return null;
  const uid = await currentUserId();
  if (!uid) return null;

  const trimmed = body.trim();
  if (!trimmed) return null;

  const { data, error } = await getSupabase()
    .from("order_messages")
    .insert({ order_id: orderId, sender_id: uid, body: trimmed })
    .select("*")
    .single();
  if (error || !data) throw error;
  return mapRow(data as MessageRow, uid);
}

/** Subscribe to new messages for an order. Returns unsubscribe. */
export function subscribeOrderMessages(
  orderId: string,
  onMessage: (message: OrderChatMessage) => void,
): () => void {
  if (!isSupabaseReady()) return () => undefined;

  const channel = getSupabase()
    .channel(`order_messages:${orderId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "order_messages", filter: `order_id=eq.${orderId}` },
      async (payload) => {
        const row = payload.new as MessageRow;
        const uid = await currentUserId();
        if (!uid) return;
        onMessage(mapRow(row, uid));
      },
    )
    .subscribe();

  return () => {
    void getSupabase().removeChannel(channel);
  };
}
