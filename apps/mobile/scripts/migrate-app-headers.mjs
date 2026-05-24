import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/screens");

const headerBlock =
  /<SafeScreenHeader[\s\S]*?<\/SafeScreenHeader>\s*\n?/g;

function migrate(file, titleExpr) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("SafeScreenHeader")) return false;
  if (!headerBlock.test(content)) return false;
  headerBlock.lastIndex = 0;
  content = content.replace(
    headerBlock,
    `      <AppHeader title={${titleExpr}} onBack={() => navigation.goBack()} />\n\n`,
  );
  content = content.replace(/import \{ SafeScreenHeader \} from "@\/components\/SafeScreenHeader";\n/, "");
  if (!content.includes('from "@/components/layout"')) {
    const idx = content.indexOf("\n", content.indexOf("import "));
    content = content.slice(0, idx + 1) + 'import { AppHeader } from "@/components/layout";\n' + content.slice(idx + 1);
  } else if (!content.includes("AppHeader")) {
    content = content.replace(
      /import \{([^}]+)\} from "@\/components\/layout";/,
      (m, inner) => (inner.includes("AppHeader") ? m : `import { AppHeader${inner.trim() ? ", " + inner.trim() : ""} } from "@/components/layout";`),
    );
  }
  fs.writeFileSync(file, content);
  return true;
}

const titles = {
  "WalletTopUpScreen.tsx": '"شحن الرصيد"',
  "WalletScreen.tsx": '"المحفظة"',
  "SettingsScreen.tsx": '"الإعدادات"',
  "ReferralScreen.tsx": '"برنامج الإحالة"',
  "ProfileScreen.tsx": '"الحساب"',
  "OrdersScreen.tsx": "T.title",
  "NotificationsScreen.tsx": '"الإشعارات"',
  "CheckoutScreen.tsx": '"الدفع"',
  "CargoRequestScreen.tsx": '"نقل بضائع / سطحة"',
  "AuthScreen.tsx": '"تسجيل الدخول"',
  "AddressesScreen.tsx": '"العناوين"',
};

for (const [name, title] of Object.entries(titles)) {
  const file = path.join(src, name);
  if (migrate(file, title)) console.log("migrated", name);
}
