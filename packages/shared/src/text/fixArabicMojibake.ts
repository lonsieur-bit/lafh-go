import type { OrderStatus } from "../types";
import { ORDER_STATUS_LABELS } from "../types";

/** Detect UTF-8 Arabic stored as Latin-1 (e.g. Ø£Ø±Ø¨Ø§Ø­ instead of أرباح). */
function looksLikeMojibake(text: string): boolean {
  return /[ØÙÃÂ][\u0080-\u00BF]?/.test(text) || /â€/.test(text) || /Ø§Ù„/.test(text);
}

/**
 * Repair common mojibake where Arabic UTF-8 bytes were interpreted as Windows-1252/Latin-1.
 */
export function fixArabicMojibake(text: string | null | undefined): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (!looksLikeMojibake(trimmed)) return trimmed;

  try {
    const bytes = Uint8Array.from([...trimmed].map((ch) => ch.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes).trim();
    if (decoded && !looksLikeMojibake(decoded)) return decoded;
  } catch {
    /* fall through */
  }

  const replacements: [RegExp, string][] = [
    [/Ø£Ø±Ø¨Ø§Ø­ Ø±Ø­Ù„Ø©/g, "أرباح رحلة"],
    [/Ø£Ø±Ø¨Ø§Ø­/g, "أرباح"],
    [/Ø´Ø­Ù† Ø§Ù„Ù…Ø­ÙØ¸Ø©/g, "شحن المحفظة"],
    [/Ø¯ÙØ¹ Ø±Ø­Ù„Ø©/g, "دفع رحلة"],
    [/Ø¨Ø·Ø§Ù‚Ø© Ù‡Ø¯ÙŠØ©/g, "بطاقة هدية"],
    [/Ù…Ø¨Ø§Ø´Ø±/g, "مباشر"],
    [/Ù…ÙƒØªÙ…Ù„Ø©/g, "مكتملة"],
    [/Ø¬Ø§Ø±ÙŠ/g, "جاري"],
    [/â€"/g, "—"],
  ];
  let out = trimmed;
  for (const [pattern, replacement] of replacements) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

/** Prefer readable Arabic; fall back to canonical status label when DB text is corrupt. */
export function resolveOrderStatusLabel(status: string, statusLabel?: string | null): string {
  const fixed = fixArabicMojibake(statusLabel);
  const arabicCount = (fixed.match(/[\u0600-\u06FF]/g) ?? []).length;
  if (fixed && arabicCount >= 2 && !looksLikeMojibake(fixed) && !/[\uFFFD]/.test(fixed)) {
    return fixed;
  }
  const key = status as OrderStatus;
  if (key in ORDER_STATUS_LABELS) {
    return ORDER_STATUS_LABELS[key];
  }
  return fixed || status;
}
