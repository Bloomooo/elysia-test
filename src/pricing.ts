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

export function calculateSurge(hour: number, dayOfWeek: string): number {
  if (hour < 10 || hour >= 22) return 0;

  const day = dayOfWeek.toLowerCase();

  if (day === "sunday") return 1.2;

  if (day === "friday" || day === "saturday") {
    if (hour >= 19) return 1.8;
    return 1.0;
  }

  // Monday-Thursday
  if (hour >= 12 && hour < 13.5) return 1.3;
  if (hour >= 19 && hour < 21) return 1.5;
  return 1.0;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface OrderResult {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  surge: number;
  total: number;
}

export function calculateOrderTotal(
  items: OrderItem[] | null | undefined,
  distance: number,
  weight: number,
  promoCode: string | null,
  hour: number,
  dayOfWeek: string,
): OrderResult {
  if (!items || items.length === 0) {
    throw new Error("Le panier ne peut pas etre vide");
  }

  for (const item of items) {
    if (item.price < 0) throw new Error("Le prix d'un article ne peut pas etre negatif");
    if (item.quantity <= 0) throw new Error("La quantite doit etre superieure a 0");
  }

  const surge = calculateSurge(hour, dayOfWeek);
  if (surge === 0) throw new Error("Le restaurant est ferme");

  const subtotal = Math.round(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100,
  ) / 100;

  const discountedSubtotal = applyPromoCode(subtotal, promoCode, DEFAULT_PROMO_CODES);
  const discount = Math.round((subtotal - discountedSubtotal) * 100) / 100;

  const baseFee = calculateDeliveryFee(distance, weight);
  const deliveryFee = Math.round(baseFee * surge * 100) / 100;

  const total = Math.round((discountedSubtotal + deliveryFee) * 100) / 100;

  return { subtotal, discount, deliveryFee, surge, total };
}
