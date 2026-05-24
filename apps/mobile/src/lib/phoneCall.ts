import { Alert, Linking } from "react-native";

/** Build a `tel:` URL from a Saudi or international phone string. */
export function phoneTelUrl(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits.length) return null;
  if (digits.startsWith("966")) return `tel:+${digits}`;
  if (digits.startsWith("0") && digits.length >= 10) return `tel:+966${digits.slice(1)}`;
  if (digits.length === 9) return `tel:+966${digits}`;
  if (phone.trim().startsWith("+")) return `tel:${phone.trim()}`;
  return `tel:+${digits}`;
}

export async function dialPhone(phone: string | null | undefined, noNumberMessage = "رقم الهاتف غير متوفر."): Promise<void> {
  const url = phoneTelUrl(phone);
  if (!url) {
    Alert.alert("غير متاح", noNumberMessage);
    return;
  }
  if (!(await Linking.canOpenURL(url))) {
    Alert.alert("غير متاح", "الاتصال غير مدعوم على هذا الجهاز.");
    return;
  }
  await Linking.openURL(url);
}
