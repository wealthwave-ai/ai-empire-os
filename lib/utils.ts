import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateChaldeanNumber(name: string): number {
  const chaldeanMap: Record<string, number> = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 8, g: 3, h: 5, i: 1,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 7, p: 8, q: 1, r: 2,
    s: 3, t: 4, u: 6, v: 6, w: 6, x: 5, y: 1, z: 7,
  };

  const cleaned = name.toLowerCase().replace(/[^a-z]/g, "");
  const sum = cleaned.split("").reduce((acc, char) => acc + (chaldeanMap[char] ?? 0), 0);

  return reduceToSingleDigit(sum);
}

export function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num
      .toString()
      .split("")
      .reduce((acc, d) => acc + parseInt(d), 0);
  }
  return num;
}

export function getNumerologyMeaning(num: number): string {
  const meanings: Record<number, string> = {
    1: "Leadership & Independence — You are a natural pioneer, driven to forge your own path.",
    2: "Cooperation & Harmony — You have an innate gift for bringing people together.",
    3: "Creativity & Expression — You thrive in communication, art, and connecting with others.",
    4: "Stability & Discipline — Your strength lies in building solid, lasting foundations.",
    5: "Freedom & Change — You are an agent of transformation, energised by variety.",
    6: "Love & Responsibility — You are a pillar of family and community.",
    7: "Spirituality & Wisdom — You are a deep thinker and seeker of truth.",
    8: "Power & Achievement — You carry the energy to build empires and lead boldly.",
    9: "Humanity & Compassion — You are here to uplift others and leave the world better.",
  };
  return meanings[num] ?? "Your number carries a rare and powerful vibration.";
}
