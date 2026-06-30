import type { TarotSuit } from '../../constants/mockTarotCards';

export type BadgeStyle = 'medallion' | 'disc';

export function formatNumeral(
  suit: TarotSuit,
  numeral: string
): { display: string; style: BadgeStyle } {
  if (suit === 'major') {
    const n = parseInt(numeral, 10);
    return { display: toRoman(isNaN(n) ? 0 : n), style: 'medallion' };
  }

  const n = numeral.toLowerCase().trim();
  if (n === 'паж' || n === 'page' || n === 'p' || n === '11')
    return { display: 'P', style: 'disc' };
  if (n === 'рицар' || n === 'knight' || n === 'r' || n === '12')
    return { display: 'R', style: 'disc' };
  if (n === 'дама' || n === 'queen' || n === 'd' || n === '13')
    return { display: 'D', style: 'disc' };
  if (n === 'крал' || n === 'king' || n === 'k' || n === '14')
    return { display: 'K', style: 'disc' };

  return { display: numeral, style: 'disc' };
}

const ROMAN_VALS = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
const ROMAN_SYMS = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];

function toRoman(num: number): string {
  if (num <= 0) return '0';
  let result = '';
  for (let i = 0; i < ROMAN_VALS.length; i++) {
    while (num >= ROMAN_VALS[i]) {
      result += ROMAN_SYMS[i];
      num -= ROMAN_VALS[i];
    }
  }
  return result;
}
