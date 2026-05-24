function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulateCaptainSearch() {
  await delay(1200);
  if (Math.random() < 0.2) {
    throw new Error("No nearby captain found, retry in a moment.");
  }
  return { captainName: "Khaled Al-Ahmad", etaMinutes: 6 };
}

export async function submitCargoRequest(payload: { itemType: string; weightKg: string }) {
  await delay(900);
  if (!payload.itemType.trim() || !payload.weightKg.trim()) {
    throw new Error("Item type and weight are required.");
  }
  return { requestId: `CR-${Math.floor(10000 + Math.random() * 90000)}` };
}

export async function generateRechargeCards(amount: number, count: number) {
  await delay(800);
  if (amount <= 0 || count <= 0) {
    throw new Error("Amount and count must be greater than zero.");
  }
  return Array.from({ length: count }, (_, idx) => `${amount}-${Date.now()}-${idx}`);
}
