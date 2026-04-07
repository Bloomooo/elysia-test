import { describe, it, expect } from "bun:test";
import { isValidEmail, isValidPassword, isValidAge } from "../src/validators";

describe("isValidEmail", () => {
  it("should return true when given valid email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("should return true when given email with plus tag", () => {
    expect(isValidEmail("user.name+tag@domain.co")).toBe(true);
  });

  it("should return false when given string without @", () => {
    expect(isValidEmail("invalid")).toBe(false);
  });

  it("should return false when given @ without local part", () => {
    expect(isValidEmail("@domain.com")).toBe(false);
  });

  it("should return false when given @ without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("should return false when given empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("should return false when given null", () => {
    expect(isValidEmail(null)).toBe(false);
  });
});

describe("isValidPassword", () => {
  it("should return valid when given compliant password", () => {
    const result = isValidPassword("Passw0rd!");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should return errors when given short password", () => {
    const result = isValidPassword("short");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should return uppercase error when given all lowercase", () => {
    const result = isValidPassword("alllowercase1!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Le mot de passe doit contenir au moins une majuscule");
  });

  it("should return lowercase error when given all uppercase", () => {
    const result = isValidPassword("ALLUPPERCASE1!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Le mot de passe doit contenir au moins une minuscule");
  });

  it("should return digit error when given no digits", () => {
    const result = isValidPassword("NoDigits!here");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Le mot de passe doit contenir au moins un chiffre");
  });

  it("should return special error when given no special chars", () => {
    const result = isValidPassword("NoSpecial1here");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Le mot de passe doit contenir au moins un caractere special");
  });

  it("should return all errors when given empty string", () => {
    const result = isValidPassword("");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(5);
  });

  it("should return all errors when given null", () => {
    const result = isValidPassword(null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(5);
  });

  it("should return multiple specific errors when given short no-digit no-special", () => {
    const result = isValidPassword("Short");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Le mot de passe doit contenir au moins 8 caracteres");
    expect(result.errors).toContain("Le mot de passe doit contenir au moins un chiffre");
    expect(result.errors).toContain("Le mot de passe doit contenir au moins un caractere special");
  });
});

describe("isValidAge", () => {
  it("should return true when given valid age", () => {
    expect(isValidAge(25)).toBe(true);
  });

  it("should return true when given 0", () => {
    expect(isValidAge(0)).toBe(true);
  });

  it("should return true when given 150", () => {
    expect(isValidAge(150)).toBe(true);
  });

  it("should return false when given negative", () => {
    expect(isValidAge(-1)).toBe(false);
  });

  it("should return false when given over 150", () => {
    expect(isValidAge(151)).toBe(false);
  });

  it("should return false when given float", () => {
    expect(isValidAge(25.5)).toBe(false);
  });

  it("should return false when given string", () => {
    expect(isValidAge("25")).toBe(false);
  });

  it("should return false when given null", () => {
    expect(isValidAge(null)).toBe(false);
  });
});
