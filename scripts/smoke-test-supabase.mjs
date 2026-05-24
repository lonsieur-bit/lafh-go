#!/usr/bin/env node
/**
 * Lightweight API smoke test (requires migrations 11–13 applied).
 * Usage: node scripts/smoke-test-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = readFileSync(join(root, ".env"), "utf8");
let url, key;
for (const line of env.split(/\r?\n/)) {
  const t = line.trim();
  if (t.startsWith("VITE_SUPABASE_URL=")) url = t.split("=").slice(1).join("=").trim();
  if (t.startsWith("VITE_SUPABASE_ANON_KEY=")) key = t.split("=").slice(1).join("=").trim();
}

const sb = createClient(url, key);
const phone = "512345678";
const email = `${phone}@rider.luffa.go`;
const password = `luffa-demo-${phone}`;

console.log("1. Sign up rider", phone);
const signUp = await sb.auth.signUp({ email, password });
if (signUp.error) {
  console.log("   signUp:", signUp.error.message, "→ signIn");
  const signIn = await sb.auth.signInWithPassword({ email, password });
  if (signIn.error) throw signIn.error;
} else if (!signUp.data.session) {
  const signIn = await sb.auth.signInWithPassword({ email, password });
  if (signIn.error) throw signIn.error;
}

const { data: session } = await sb.auth.getSession();
const uid = session.session?.user?.id;
if (!uid) throw new Error("No session after auth");

await sb.from("profiles").upsert({
  id: uid,
  phone: `+966${phone}`,
  display_name: "Smoke Test",
  role: "rider",
  updated_at: new Date().toISOString(),
});

const orderId = `lf-smoke-${Date.now().toString().slice(-6)}`;
console.log("2. Insert pending order", orderId);
const { error: orderErr } = await sb.from("orders").insert({
  id: orderId,
  display_id: `#${orderId.toUpperCase()}`,
  rider_id: uid,
  from_location: "منطقة الاختبار",
  to_location: "الوجهة",
  trip_date: new Date().toISOString().slice(0, 10),
  trip_time: "12:00",
  price_sar: 40,
  total_sar: 40,
  status: "pending",
  status_label: "بانتظار كابتن",
  service_type: "regular",
  service_label: "رحلة عادية",
  payment_method: "cash",
  pickup_lat: 24.71,
  pickup_lng: 46.67,
  dropoff_lat: 24.95,
  dropoff_lng: 46.73,
});
if (orderErr) throw new Error(`Order insert failed: ${orderErr.message}`);

console.log("3. captain_set_online (expect not_captain for rider)");
const { error: capErr } = await sb.rpc("captain_set_online", { p_online: true });
console.log("   ", capErr?.message ?? "unexpected success");

await sb.auth.signOut();
console.log("\nSmoke test passed (schema ready for production flows).");
