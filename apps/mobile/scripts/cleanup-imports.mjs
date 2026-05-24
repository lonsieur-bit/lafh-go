import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".tsx")) cleanup(p);
  }
}

function cleanup(file) {
  let src = fs.readFileSync(file, "utf8");
  const orig = src;
  if (src.includes("SafeScreenHeader") && !src.includes("<SafeScreenHeader")) {
    src = src.replace(/import \{ SafeScreenHeader \} from "@\/components\/SafeScreenHeader";\n/g, "");
  }
  if (src.includes("gradients.") && !src.match(/import \{[^}]*gradients/)) {
    if (src.includes('from "@/theme/tokens"')) {
      src = src.replace(
        /import \{([^}]+)\} from "@\/theme\/tokens";/,
        (m, inner) => (inner.includes("gradients") ? m : `import { ${inner.trim()}, gradients } from "@/theme/tokens";`),
      );
    } else {
      const m = src.match(/^import .+ from .+;\n/m);
      if (m) {
        const idx = m.index + m[0].length;
        src = src.slice(0, idx) + 'import { colors, gradients } from "@/theme/tokens";\n' + src.slice(idx);
      }
    }
  }
  if (src !== orig) {
    fs.writeFileSync(file, src);
    console.log("cleaned", path.relative(root, file));
  }
}

walk(root);
