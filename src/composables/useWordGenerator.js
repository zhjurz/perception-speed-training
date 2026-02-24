import { wordDatabase } from "../data/wordDatabase.js";

export function useWordGenerator() {
  function generateTableWords() {
    const words = [...wordDatabase.words];
    const shuffled = words.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 15);
  }

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  return {
    generateTableWords,
    shuffleArray,
  };
}
