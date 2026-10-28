export class Tokenizer {
  tokenize(line: string): string[] {
    const tokens: string[] = [];
    let token = '';
    let quoted = false;
    let escaping = false;
    for (const char of line.trim()) {
      if (escaping) { token += char; escaping = false; continue; }
      if (char === '\\' && quoted) { escaping = true; continue; }
      if (char === '"') { quoted = !quoted; continue; }
      if (/\s/.test(char) && !quoted) { if (token) { tokens.push(token); token = ''; } continue; }
      token += char;
    }
    if (escaping || quoted) throw new Error('unterminated quoted argument');
    if (token) tokens.push(token);
    return tokens;
  }
}
