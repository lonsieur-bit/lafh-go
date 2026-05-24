/** Public support & contact info (mobile + admin). */
export const supportConfig = {
  email: "support@lafhride.info",
  whatsappNumber: "966531350313",
  whatsappLabel: "+966 53 135 0313",
  hoursAr: "الأحد – الخميس · 9 ص – 6 م",
  addressAr:
    "الجمهورية العربية السورية — حماة — ساحة المحافظة — بناء عبد الباقي ط 5 — 3919 عقارية رابعة",
  companyNameAr: "لفة — Lafh Ride",
} as const;

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${supportConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
