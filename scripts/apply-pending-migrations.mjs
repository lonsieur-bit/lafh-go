#!/usr/bin/env node
/**
 * Apply pending Supabase migrations when CLI login is unavailable.
 *
 * Set SUPABASE_DB_URL (full postgres URL) or both:
 *   SUPABASE_DB_PASSWORD — from Dashboard → Settings → Database
 *   SUPABASE_PROJECT_REF — defaults to vyozqojqivumthiztxkg
 *
 * Usage: node scripts/apply-pending-migrations.mjs
 */
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const migrationsDir = join(root, "supabase", "migrations");

const PENDING_FROM = "20250524000001";

function getDbUrl() {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) return null;
  const ref = process.env.SUPABASE_PROJECT_REF || "vyozqojqivumthiztxkg";
  const host = process.env.SUPABASE_DB_HOST || `db.${ref}.supabase.co`;
  const user = process.env.SUPABASE_DB_USER || "postgres";
  const port = process.env.SUPABASE_DB_PORT || "5432";
  const db = process.env.SUPABASE_DB_NAME || "postgres";
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${db}`;
}

async function main() {
  const dbUrl = getDbUrl();
  if (!dbUrl) {
    console.error(
      "Missing SUPABASE_DB_URL or SUPABASE_DB_PASSWORD.\n" +
        "Get the database password from Supabase Dashboard → Settings → Database,\n" +
        "then run:\n" +
        "  $env:SUPABASE_DB_PASSWORD='your-password'; node scripts/apply-pending-migrations.mjs",
    );
    process.exit(1);
  }

  let pg;
  try {
    pg = await import("pg");
  } catch {
    console.error("Install pg: npm install pg --save-dev");
    process.exit(1);
  }

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql") && f >= `${PENDING_FROM}_`)
    .sort();

  if (files.length === 0) {
    console.log("No pending migration files found.");
    return;
  }

  const client = new pg.default.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log(`Connected. Applying ${files.length} migration(s)...`);

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    const version = file.replace(/_.*$/, "");
    console.log(`\n→ ${file}`);
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        `INSERT INTO supabase_migrations.schema_migrations (version, name)
         VALUES ($1, $2)
         ON CONFLICT (version) DO NOTHING`,
        [version, file],
      );
      await client.query("COMMIT");
      console.log(`  ✓ applied`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`  ✗ failed: ${err.message}`);
      throw err;
    }
  }

  await client.end();
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
