/** Format E.164 Saudi phone for display (e.g. +966512345678 → +966 512 345 678). */
export function formatProfilePhone(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("966") && digits.length >= 12) {
    const local = digits.slice(3, 12);
    return `+966 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`.trim();
  }
  if (digits.length === 9 && digits.startsWith("5")) {
    return `+966 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone.trim();
}
