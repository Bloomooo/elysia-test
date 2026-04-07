export function capitalize(str: string | null | undefined): string {
  if (!str) return "";
  return str[0]!.toUpperCase() + str.slice(1).toLowerCase();
}

export function calculateAverage(numbers: number[] | null | undefined): number {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  return Math.round((sum / numbers.length) * 100) / 100;
}

export function slugify(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export interface Student {
  name: string;
  grade: number;
  age: number;
}

export function sortStudents(
  students: Student[] | null | undefined,
  sortBy: "name" | "grade" | "age",
  order: "asc" | "desc" = "asc",
): Student[] {
  if (!students || students.length === 0) return [];

  const sorted = [...students];
  sorted.sort((a, b) => {
    let comparison: number;
    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name);
    } else {
      comparison = a[sortBy] - b[sortBy];
    }
    return order === "desc" ? -comparison : comparison;
  });

  return sorted;
}
