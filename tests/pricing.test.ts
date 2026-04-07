import { describe, it, expect } from "bun:test";
import {
  calculateDeliveryFee,
  applyPromoCode,
  calculateSurge,
  calculateOrderTotal,
  type PromoCode,
} from "../src/pricing";

describe("calculateDeliveryFee", () => {
  it("should return base fee when distance <= 3km and weight <= 5kg", () => {
    expect(calculateDeliveryFee(2, 1)).toBe(2.0);
  });

  it("should add distance surcharge when beyond 3km", () => {
    expect(calculateDeliveryFee(7, 3)).toBe(4.0);
  });

  it("should add weight surcharge when weight > 5kg", () => {
    expect(calculateDeliveryFee(5, 8)).toBe(4.5);
  });

  it("should return base fee when exactly 3km", () => {
    expect(calculateDeliveryFee(3, 1)).toBe(2.0);
  });

  it("should accept exactly 10km", () => {
    expect(calculateDeliveryFee(10, 2)).toBe(5.5);
  });

  it("should add both surcharges when distance and weight exceed limits", () => {
    expect(calculateDeliveryFee(10, 6)).toBe(7.0);
  });

  it("should not add weight surcharge when exactly 5kg", () => {
    expect(calculateDeliveryFee(3, 5)).toBe(2.0);
  });

  it("should throw when distance exceeds 10km", () => {
    expect(() => calculateDeliveryFee(15, 1)).toThrow();
  });

  it("should throw when distance is negative", () => {
    expect(() => calculateDeliveryFee(-1, 1)).toThrow();
  });

  it("should throw when weight is negative", () => {
    expect(() => calculateDeliveryFee(3, -1)).toThrow();
  });

  it("should return base fee when distance is 0", () => {
    expect(calculateDeliveryFee(0, 1)).toBe(2.0);
  });
});

describe("applyPromoCode", () => {
  const promoCodes: PromoCode[] = [
    { code: "BIENVENUE20", type: "percentage", value: 20, minOrder: 15, expiresAt: "2030-12-31" },
    { code: "REDUC5", type: "fixed", value: 5, minOrder: 10, expiresAt: "2030-12-31" },
    { code: "EXPIRE", type: "percentage", value: 10, minOrder: 0, expiresAt: "2020-01-01" },
    { code: "GROS", type: "fixed", value: 100, minOrder: 0, expiresAt: "2030-12-31" },
    { code: "FULL", type: "percentage", value: 100, minOrder: 0, expiresAt: "2030-12-31" },
  ];

  it("should apply percentage discount correctly", () => {
    expect(applyPromoCode(50, "BIENVENUE20", promoCodes)).toBe(40);
  });

  it("should apply fixed discount correctly", () => {
    expect(applyPromoCode(30, "REDUC5", promoCodes)).toBe(25);
  });

  it("should return subtotal when no promo code given", () => {
    expect(applyPromoCode(50, null, promoCodes)).toBe(50);
  });

  it("should return subtotal when empty promo code given", () => {
    expect(applyPromoCode(50, "", promoCodes)).toBe(50);
  });

  it("should throw when promo code is unknown", () => {
    expect(() => applyPromoCode(50, "FAKE", promoCodes)).toThrow("Code promo inconnu");
  });

  it("should throw when promo code is expired", () => {
    expect(() => applyPromoCode(50, "EXPIRE", promoCodes)).toThrow("Code promo expire");
  });

  it("should throw when subtotal below minOrder", () => {
    expect(() => applyPromoCode(10, "BIENVENUE20", promoCodes)).toThrow("Commande minimum non atteinte");
  });

  it("should floor result at 0 when discount exceeds subtotal", () => {
    expect(applyPromoCode(5, "GROS", promoCodes)).toBe(0);
  });

  it("should return 0 when percentage is 100%", () => {
    expect(applyPromoCode(50, "FULL", promoCodes)).toBe(0);
  });

  it("should throw when subtotal is negative", () => {
    expect(() => applyPromoCode(-10, "BIENVENUE20", promoCodes)).toThrow();
  });
});

describe("calculateSurge", () => {
  it("should return 1.0 when normal weekday afternoon", () => {
    expect(calculateSurge(15, "tuesday")).toBe(1.0);
  });

  it("should return 1.3 when weekday lunch", () => {
    expect(calculateSurge(12.5, "wednesday")).toBe(1.3);
  });

  it("should return 1.5 when weekday dinner", () => {
    expect(calculateSurge(20, "thursday")).toBe(1.5);
  });

  it("should return 1.8 when weekend evening", () => {
    expect(calculateSurge(20, "friday")).toBe(1.8);
  });

  it("should return 1.2 when sunday", () => {
    expect(calculateSurge(14, "sunday")).toBe(1.2);
  });

  it("should return 0 when closed before 10h", () => {
    expect(calculateSurge(9, "monday")).toBe(0);
  });

  it("should return 0 when closed at 22h", () => {
    expect(calculateSurge(22, "tuesday")).toBe(0);
  });

  it("should return 1.0 when exactly 10h weekday", () => {
    expect(calculateSurge(10, "monday")).toBe(1.0);
  });

  it("should return 1.0 when saturday daytime", () => {
    expect(calculateSurge(14, "saturday")).toBe(1.0);
  });

  it("should return 0 when sunday before 10h", () => {
    expect(calculateSurge(8, "sunday")).toBe(0);
  });
});

describe("calculateOrderTotal", () => {
  const items = [{ name: "Pizza", price: 12.5, quantity: 2 }];

  it("should calculate correct total for normal order", () => {
    const result = calculateOrderTotal(items, 5, 2, null, 15, "tuesday");
    expect(result.subtotal).toBe(25);
    expect(result.discount).toBe(0);
    expect(result.deliveryFee).toBe(3.0);
    expect(result.surge).toBe(1.0);
    expect(result.total).toBe(28.0);
  });

  it("should apply promo code and calculate total", () => {
    const result = calculateOrderTotal(items, 5, 2, "BIENVENUE20", 15, "tuesday");
    expect(result.subtotal).toBe(25);
    expect(result.discount).toBe(5);
    expect(result.total).toBe(23.0);
  });

  it("should apply surge to delivery fee only", () => {
    const result = calculateOrderTotal(items, 5, 2, null, 20, "friday");
    expect(result.surge).toBe(1.8);
    expect(result.deliveryFee).toBe(5.4);
    expect(result.subtotal).toBe(25);
    expect(result.total).toBe(30.4);
  });

  it("should throw when items array is empty", () => {
    expect(() => calculateOrderTotal([], 5, 2, null, 15, "tuesday")).toThrow("Le panier ne peut pas etre vide");
  });

  it("should throw when items is null", () => {
    expect(() => calculateOrderTotal(null, 5, 2, null, 15, "tuesday")).toThrow("Le panier ne peut pas etre vide");
  });

  it("should throw when item has negative price", () => {
    const badItems = [{ name: "Bad", price: -5, quantity: 1 }];
    expect(() => calculateOrderTotal(badItems, 5, 2, null, 15, "tuesday")).toThrow();
  });

  it("should throw when restaurant is closed", () => {
    expect(() => calculateOrderTotal(items, 5, 2, null, 23, "tuesday")).toThrow("Le restaurant est ferme");
  });

  it("should throw when distance exceeds 10km", () => {
    expect(() => calculateOrderTotal(items, 15, 2, null, 15, "tuesday")).toThrow();
  });

  it("should return correct structure with all fields", () => {
    const result = calculateOrderTotal(items, 3, 1, null, 15, "tuesday");
    expect(result).toHaveProperty("subtotal");
    expect(result).toHaveProperty("discount");
    expect(result).toHaveProperty("deliveryFee");
    expect(result).toHaveProperty("surge");
    expect(result).toHaveProperty("total");
  });

  it("should handle order with multiple items", () => {
    const multiItems = [
      { name: "Pizza", price: 12.5, quantity: 2 },
      { name: "Soda", price: 3.0, quantity: 1 },
    ];
    const result = calculateOrderTotal(multiItems, 3, 1, null, 15, "tuesday");
    expect(result.subtotal).toBe(28.0);
    expect(result.total).toBe(30.0);
  });
});
