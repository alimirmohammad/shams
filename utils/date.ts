export function convertToJalaliString(date: string): string {
  return new Date(date).toLocaleDateString('fa-IR');
}
