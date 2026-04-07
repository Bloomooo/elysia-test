export interface PromoCode {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  expiresAt: string;
}

export const DEFAULT_PROMO_CODES: PromoCode[] = [
  { code: "BIENVENUE20", type: "percentage", value: 20, minOrder: 15, expiresAt: "2030-12-31" },
  { code: "REDUC5", type: "fixed", value: 5, minOrder: 10, expiresAt: "2030-12-31" },
  { code: "PROMO50", type: "percentage", value: 50, minOrder: 30, expiresAt: "2030-12-31" },
];

export function calculateDeliveryFee(distance: number, weight: number): number {
  if (distance < 0 || weight < 0) {
    throw new Error("La distance et le poids doivent etre positifs");
  }
  if (distance > 10) {
    throw new Error("La distance de livraison ne peut pas depasser 10 km");
  }

  let fee = 2.0;
  if (distance > 3) {
    fee += (distance - 3) * 0.5;
  }
  if (weight > 5) {
    fee += 1.5;
  }

  return Math.round(fee * 100) / 100;
}

export function applyPromoCode(
  subtotal: number,
  promoCode: string | null | undefined,
  promoCodes: PromoCode[],
): number {
  if (!promoCode) return subtotal;
  if (subtotal < 0) throw new Error("Le sous-total ne peut pas etre negatif");

  const promo = promoCodes.find((p) => p.code === promoCode);
  if (!promo) throw new Error("Code promo inconnu");

  if (new Date(promo.expiresAt) < new Date()) {
    throw new Error("Code promo expire");
  }

  if (subtotal < promo.minOrder) {
    throw new Error("Commande minimum non atteinte");
  }

  let result: number;
  if (promo.type === "percentage") {
    result = subtotal - (subtotal * promo.value) / 100;
  } else {
    result = subtotal - promo.value;
  }

  return Math.max(0, Math.round(result * 100) / 100);
}
