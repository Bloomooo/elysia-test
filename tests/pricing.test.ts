import { describe, it, expect } from "bun:test";
import { calculateDeliveryFee } from "../src/pricing";

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
