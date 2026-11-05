/** Map common UZ/EN aliases to dataset Russian product tokens. */
export function normalizeProductHint(hint: string): string {
  const h = hint.trim().toLowerCase();
  const aliases: Array<[RegExp, string]> = [
    [/\b(paxta|pakhta|cotton|хлопок)\b/i, 'хлопок'],
    [/\b(bug.?doy|wheat|пшениц)/i, 'пшениц'],
    [/\b(neft|oil|нефть)\b/i, 'нефть'],
    [/\b(gaz|gas)\b/i, 'газ'],
    [/\b(shakar|sugar|сахар)\b/i, 'сахар'],
    [/\b(un|flour|мука)\b/i, 'мука'],
    [/\b(tsement|cement|цемент)\b/i, 'цемент']
  ];
  for (const [re, token] of aliases) {
    if (re.test(h)) return token;
  }
  return hint.trim();
}
