export type PromoSuccess = { ok: true; amount: number; label: string };
export type PromoFailure = { ok: false; message: string };
export type PromoResult = PromoSuccess | PromoFailure;

const COUPONS: Record<string, (total: number) => PromoSuccess> = {
  LUFFA30: (total) => ({
    ok: true,
    amount: Math.round(Math.min(total * 0.3, 15) * 100) / 100,
    label: "خصم 30% (بحد أقصى 15 ر.س)",
  }),
  LF10: (total) => ({
    ok: true,
    amount: Math.round(Math.min(10, total) * 100) / 100,
    label: "خصم 10 ر.س",
  }),
  WELCOME: (total) => ({
    ok: true,
    amount: Math.round(Math.min(5, total) * 100) / 100,
    label: "خصم ترحيب 5 ر.س",
  }),
};

export function validateCouponCode(code: string, orderTotal: number): PromoResult {
  const key = code.trim().toUpperCase();
  if (!key) return { ok: false, message: "أدخل كود الخصم." };
  const fn = COUPONS[key];
  if (!fn) return { ok: false, message: "كود خصم غير صالح أو منتهي." };
  const result = fn(orderTotal);
  if (result.amount <= 0) return { ok: false, message: "لا يمكن تطبيق هذا الكود على هذا المبلغ." };
  return result;
}
