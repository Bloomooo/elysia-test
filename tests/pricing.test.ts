import { describe, it, expect } from "bun:test";
import { calculateDeliveryFee, applyPromoCode, type PromoCode } from "../src/pricing";

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
