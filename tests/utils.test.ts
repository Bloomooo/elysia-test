import { describe, it, expect } from "bun:test";
import { capitalize, calculateAverage, slugify, clamp, sortStudents, type Student } from "../src/utils";

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

describe("sortStudents", () => {
  const students: Student[] = [
    { name: "Charlie", grade: 15, age: 22 },
    { name: "Alice", grade: 18, age: 20 },
    { name: "Bob", grade: 12, age: 21 },
  ];

  it("should sort students by grade ascending", () => {
    const result = sortStudents(students, "grade", "asc");
    expect(result.map((s) => s.name)).toEqual(["Bob", "Charlie", "Alice"]);
  });

  it("should sort students by grade descending", () => {
    const result = sortStudents(students, "grade", "desc");
    expect(result.map((s) => s.name)).toEqual(["Alice", "Charlie", "Bob"]);
  });

  it("should sort students by name ascending", () => {
    const result = sortStudents(students, "name", "asc");
    expect(result.map((s) => s.name)).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("should sort students by age ascending", () => {
    const result = sortStudents(students, "age", "asc");
    expect(result.map((s) => s.name)).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("should return empty array when given null", () => {
    const result = sortStudents(null, "grade");
    expect(result).toEqual([]);
  });

  it("should return empty array when given empty array", () => {
    const result = sortStudents([], "grade");
    expect(result).toEqual([]);
  });

  it("should not modify the original array", () => {
    const original = [...students];
    sortStudents(students, "grade", "asc");
    expect(students).toEqual(original);
  });

  it("should default to ascending order", () => {
    const result = sortStudents(students, "grade");
    expect(result.map((s) => s.name)).toEqual(["Bob", "Charlie", "Alice"]);
  });
});
