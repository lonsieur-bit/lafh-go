#!/usr/bin/env node
/** Probe remote Supabase for go-live readiness. */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let url = process.env.VITE_SUPABASE_URL;
let key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  try {
    const envPath = join(root, ".env");
    const env = readFileSync(envPath, "utf8");
    for (const line of env.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const k = trimmed.slice(0, eq).trim();
      const v = trimmed.slice(eq + 1).trim();
      if (k === "VITE_SUPABASE_URL") url = v;
      if (k === "VITE_SUPABASE_ANON_KEY") key = v;
    }
  } catch (e) {
    console.error("Could not read .env:", e.message);
  }
}
if (!url || !key) {
  console.error("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const sb = createClient(url, key);
const checks = [
  { name: "orders.pickup_lat", run: () => sb.from("orders").select("pickup_lat").limit(0) },
  { name: "orders.captain_quote_sar", run: () => sb.from("orders").select("captain_quote_sar").limit(0) },
  { name: "push_tokens table", run: () => sb.from("push_tokens").select("id").limit(0) },
  {
    name: "captain_set_online RPC",
    run: () => sb.rpc("captain_set_online", { p_online: false }),
  },
  {
    name: "captain_freight_respond RPC",
    run: () => sb.rpc("captain_freight_respond", { p_order_id: "x", p_use_rider_price: true }),
  },
  { name: "rider_wallet_apply RPC", run: () => sb.rpc("rider_wallet_apply", { p_amount_sar: 1, p_positive: true, p_title: "t" }) },
  { name: "redeem_gift_card RPC", run: () => sb.rpc("redeem_gift_card", { p_code: "TEST" }) },
];

async function main() {
  let ok = 0;
  let fail = 0;
  for (const c of checks) {
    const { error } = await c.run();
    const msg = error?.message ?? "";
    // Function exists if error is auth/business logic, not "not found in schema"
    const missing = /Could not find the function|Could not find the table|column .+ does not exist/i.test(msg);
    const pass = !error || !missing;
    if (pass) {
      console.log(`✓ ${c.name}`);
      ok++;
    } else {
      console.log(`✗ ${c.name}: ${msg}`);
      fail++;
    }
  }
  console.log(`\n${ok} passed, ${fail} failed`);
  if (fail > 0) {
    console.log("\nApply pending migrations: see supabase/SETUP.md");
  }
  process.exit(fail > 0 ? 1 : 0);
}

main();
