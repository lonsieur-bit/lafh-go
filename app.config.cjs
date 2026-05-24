/**
 * Minimal Expo config at monorepo root for EAS GitHub (project directory `/`).
 * Native prebuild runs in apps/mobile via eas.json prebuildCommand.
 */
const path = require("path");
const fs = require("fs");

const mobileRoot = path.join(__dirname, "apps", "mobile");
const appJson = require(path.join(mobileRoot, "app.json"));

function loadRootEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

const rootEnv = loadRootEnv();
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  rootEnv.EXPO_PUBLIC_SUPABASE_URL ||
  rootEnv.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  rootEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  rootEnv.VITE_SUPABASE_ANON_KEY;

const { plugins: _plugins, ...expoWithoutPlugins } = appJson.expo;

module.exports = {
  expo: {
    ...expoWithoutPlugins,
    extra: {
      ...appJson.expo.extra,
      eas: {
        projectId: "8fcb8f31-0eba-4642-bedb-802b5e283674",
      },
      supabaseUrl,
      supabaseAnonKey,
    },
  },
};
