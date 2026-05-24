import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");
const replacements = [
  ['color="hsl(260 25% 11%)"', "color={colors.foreground}"],
  ['color="hsl(260 10% 46%)"', "color={colors.mutedForeground}"],
  ['color="hsl(262 83% 58%)"', "color={colors.primary}"],
  ['placeholderTextColor="hsl(260 10% 46%)"', "placeholderTextColor={colors.mutedForeground}"],
  ['stroke="hsl(262 83% 58%)"', "stroke={colors.primary}"],
  ['color="hsl(45 93% 47%)"', "color={colors.warning}"],
  ['fill="hsl(45 93% 47%)"', "fill={colors.warning}"],
  ['color="hsl(152 69% 40%)"', "color={colors.success}"],
  ['color="hsl(0 72% 51%)"', "color={colors.destructive}"],
  ['color={sel ? "hsl(262 83% 58%)" : "hsl(260 25% 11%)"}', "color={sel ? colors.primary : colors.foreground}"],
  ['trackColor={{ true: "hsl(152 69% 40%)", false: "hsl(260 14% 96%)" }}', "trackColor={{ true: colors.success, false: colors.secondary }}"],
  ['color={captainOnline ? "hsl(152 69% 40%)" : "hsl(262 83% 58%)"}', "color={captainOnline ? colors.success : colors.primary}"],
  ['colors={["hsl(262 83% 58%)", "hsl(262 83% 52%)"]}', "colors={gradients.primary}"],
  ['colors={["hsl(262 83% 58%)", "hsl(262 83% 48%)"]}', "colors={gradients.primary}"],
  ['colors={["hsl(262 83% 58%)", "hsl(280 65% 45%)"]}', "colors={gradients.avatar}"],
  ['colors={mine ? ["hsl(262 83% 58%)", "hsl(262 78% 50%)"] : ["hsl(280 25% 99%)", "hsl(270 18% 97%)"]}', "colors={mine ? gradients.chatMine : gradients.chatTheirs}"],
  ['colors={["hsl(270 35% 98%)", "hsl(262 28% 96%)"]}', "colors={gradients.chatBg}"],
  ['colors={["hsl(262 42% 94%)", "hsl(280 25% 98%)"]}', "colors={gradients.primarySoft}"],
  ['borderBottomColor: "hsl(260 14% 90%)"', "borderBottomColor: colors.border"],
  ['borderColor: "hsl(260 14% 90%)"', "borderColor: colors.border"],
];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".tsx")) fix(p);
  }
}

function fix(file) {
  let src = fs.readFileSync(file, "utf8");
  let changed = false;
  for (const [from, to] of replacements) {
    if (src.includes(from)) {
      src = src.split(from).join(to);
      changed = true;
    }
  }
  if (!changed) return;
  const needsColors = src.includes("colors.") && !src.includes('@/theme/tokens"');
  const needsGradients = src.includes("gradients.") && !src.includes("gradients");
  if (needsColors || needsGradients) {
    const m = src.match(/^import .+ from .+;\n/m);
    if (m) {
      const idx = m.index + m[0].length;
      const parts = [];
      if (needsColors) parts.push("colors");
      if (needsGradients) parts.push("gradients");
      src = src.slice(0, idx) + `import { ${parts.join(", ")} } from "@/theme/tokens";\n` + src.slice(idx);
    }
  }
  fs.writeFileSync(file, src);
  console.log("fixed", path.relative(root, file));
}

walk(root);
