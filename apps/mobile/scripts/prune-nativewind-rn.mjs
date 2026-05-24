import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const mobileRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(mobileRoot, "../..");
const wantRn = "0.81.5";

const nestedRn = path.join(
  workspaceRoot,
  "node_modules",
  "nativewind",
  "node_modules",
  "react-native",
);
const cachePaths = [
  path.join(
    workspaceRoot,
    "node_modules",
    "nativewind",
    "node_modules",
    "react-native-css-interop",
    ".cache",
  ),
  path.join(mobileRoot, "node_modules", "react-native-css-interop", ".cache"),
];

for (const cache of cachePaths) {
  if (fs.existsSync(cache)) {
    fs.rmSync(cache, { recursive: true, force: true, maxRetries: 3 });
    console.log(`Cleared ${path.relative(workspaceRoot, cache)}`);
  }
}

if (!fs.existsSync(nestedRn)) {
  process.exit(0);
}

let version;
try {
  version = JSON.parse(fs.readFileSync(path.join(nestedRn, "package.json"), "utf8")).version;
} catch {
  version = null;
}

if (version === wantRn) {
  console.log(`nativewind react-native ${wantRn} OK.`);
  process.exit(0);
}

console.warn(
  `nativewind has react-native ${version ?? "?"} (expected ${wantRn}). ` +
    "Removing nested copy — run npm install from repo root if builds fail.",
);
fs.rmSync(nestedRn, { recursive: true, force: true, maxRetries: 3 });
process.exit(0);
