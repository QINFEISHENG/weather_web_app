// lib/city_key.ts
//make sure that all the input from the user are standarlizrd
export function cityKeyOf(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " "); // "New York" -> "new york"
}