export function convertToPersianDigit(
  num: number,
  noSeparator?: boolean
): string {
  const formattedStringWithComma = num.toLocaleString('fa-IR');
  if (noSeparator) return formattedStringWithComma.replace(/٬/g, '');
  return formattedStringWithComma;
}

export function convertToEnglishDigit(s: string): string {
  return s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
}

export function commafy(s: string): string {
  if (!s) return s;
  const num = Number(s);
  if (isNaN(num)) return '';
  return Number(s).toLocaleString('en-US');
}

export function decommafy(s: string): string {
  return s.replace(/,/g, '');
}

export function transformPrice(e: Event): string {
  const value = (e.target as HTMLInputElement).value;
  return decommafy(value);
}
