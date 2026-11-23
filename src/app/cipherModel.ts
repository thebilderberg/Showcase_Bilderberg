export const alphabets = {
  en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ru: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
};
export type Alphabet = keyof typeof alphabets;
export const modulo = (value: number, length: number) => ((value % length) + length) % length;
export function caesar(text: string, shift: number) {
  return Array.from(text)
    .map((char) => {
      const upper = char.toUpperCase();
      for (const alphabet of Object.values(alphabets)) {
        const index = alphabet.indexOf(upper);
        if (index < 0 || upper.length !== 1) continue;
        const transformed = alphabet[modulo(index + shift, alphabet.length)];
        return char === upper ? transformed : transformed.toLowerCase();
      }
      return char;
    })
    .join('');
}
export const archivePhrase = 'ЗНАНИЕ ОТКРЫВАЕТ ДВЕРИ';
export const archiveCipher = caesar(archivePhrase, 7);
