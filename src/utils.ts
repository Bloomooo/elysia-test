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
