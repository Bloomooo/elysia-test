import { describe, it, expect } from "bun:test";
import { capitalize, calculateAverage, slugify, clamp } from "../src/utils";

describe("capitalize", () => {
  it("should return capitalized string when given lowercase", () => {
    const result = capitalize("hello");
    expect(result).toBe("Hello");
  });

  it("should return capitalized string when given uppercase", () => {
    const result = capitalize("WORLD");
    expect(result).toBe("World");
  });

  it("should return empty string when given empty string", () => {
    const result = capitalize("");
    expect(result).toBe("");
  });

  it("should return empty string when given null", () => {
    const result = capitalize(null);
    expect(result).toBe("");
  });
});

describe("calculateAverage", () => {
  it("should return correct average when given multiple numbers", () => {
    const result = calculateAverage([10, 12, 14]);
    expect(result).toBe(12);
  });

  it("should return the number when given single element", () => {
    const result = calculateAverage([15]);
    expect(result).toBe(15);
  });

  it("should return 0 when given empty array", () => {
    const result = calculateAverage([]);
    expect(result).toBe(0);
  });

  it("should return rounded average when given numbers", () => {
    const result = calculateAverage([10, 11, 12]);
    expect(result).toBe(11);
  });

  it("should return 0 when given null", () => {
    const result = calculateAverage(null);
    expect(result).toBe(0);
  });
});

describe("slugify", () => {
  it("should return slug when given normal text", () => {
    const result = slugify("Hello World");
    expect(result).toBe("hello-world");
  });

  it("should trim and slugify when given padded text", () => {
    const result = slugify(" Spaces Everywhere ");
    expect(result).toBe("spaces-everywhere");
  });

  it("should remove special chars when given accented text", () => {
    const result = slugify("C'est l'ete !");
    expect(result).toBe("cest-lete");
  });

  it("should return empty string when given empty string", () => {
    const result = slugify("");
    expect(result).toBe("");
  });
});

describe("clamp", () => {
  it("should return value when within range", () => {
    const result = clamp(5, 0, 10);
    expect(result).toBe(5);
  });

  it("should return min when value below min", () => {
    const result = clamp(-5, 0, 10);
    expect(result).toBe(0);
  });

  it("should return max when value above max", () => {
    const result = clamp(15, 0, 10);
    expect(result).toBe(10);
  });

  it("should return 0 when all zeros", () => {
    const result = clamp(0, 0, 0);
    expect(result).toBe(0);
  });
});
