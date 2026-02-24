import { wordDatabase, getDistractionWords } from '../data/wordDatabase.js'

export function useQuestionGenerator() {
  
  function generateQuestions(tableWords, difficulty = 'medium') {
    const questions = []
    const usedCorrectCounts = distributeCorrectCounts()
    
    for (let i = 0; i < 10; i++) {
      const correctCount = usedCorrectCounts[i]
      const question = generateSingleQuestion(tableWords, correctCount, difficulty, i)
      questions.push(question)
    }
    
    return questions
  }
  
  function distributeCorrectCounts() {
    const counts = []
    for (let i = 0; i <= 4; i++) {
      counts.push(i, i)
    }
    
    for (let i = counts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[counts[i], counts[j]] = [counts[j], counts[i]]
    }
    
    return counts
  }
  
  function generateSingleQuestion(tableWords, correctCount, difficulty, questionIndex) {
    const shuffledTableWords = [...tableWords].sort(() => Math.random() - 0.5)
    const selectedFromTable = shuffledTableWords.slice(0, correctCount)
    
    const distractions = generateDistractions(
      selectedFromTable,
      5 - correctCount,
      difficulty,
      tableWords
    )
    
    const allWords = [...selectedFromTable, ...distractions]
    const shuffledWords = allWords.sort(() => Math.random() - 0.5)
    
    return {
      index: questionIndex,
      words: shuffledWords,
      correctAnswer: correctCount,
      wordsFromTable: selectedFromTable,
      distractions: distractions
    }
  }
  
  function generateDistractions(fromTableWords, count, difficulty, tableWords) {
    const distractions = []
    const excludeWords = [...tableWords, ...fromTableWords]
    
    if (difficulty === 'easy') {
      const randomDistractions = getDistractionWords(count, excludeWords)
      distractions.push(...randomDistractions)
    } else if (difficulty === 'medium') {
      const synonymDistractions = []
      const availableSynonyms = []
      
      for (const word of fromTableWords) {
        const synonyms = wordDatabase.synonyms[word] || []
        for (const syn of synonyms) {
          if (!excludeWords.includes(syn) && !synonymDistractions.includes(syn)) {
            availableSynonyms.push(syn)
          }
        }
      }
      
      const shuffledSynonyms = availableSynonyms.sort(() => Math.random() - 0.5)
      synonymDistractions.push(...shuffledSynonyms.slice(0, Math.min(count, availableSynonyms.length)))
      
      const remainingCount = count - synonymDistractions.length
      if (remainingCount > 0) {
        const randomDistractions = getDistractionWords(remainingCount, [...excludeWords, ...synonymDistractions])
        synonymDistractions.push(...randomDistractions)
      }
      
      distractions.push(...synonymDistractions)
    } else if (difficulty === 'hard') {
      const similarDistractions = []
      const availableSimilar = []
      
      for (const word of fromTableWords) {
        const similarWords = wordDatabase.similarShapeWords[word] || []
        for (const sim of similarWords) {
          if (!excludeWords.includes(sim) && !similarDistractions.includes(sim)) {
            availableSimilar.push(sim)
          }
        }
      }
      
      const shuffledSimilar = availableSimilar.sort(() => Math.random() - 0.5)
      similarDistractions.push(...shuffledSimilar.slice(0, Math.min(count, availableSimilar.length)))
      
      const remainingCount = count - similarDistractions.length
      if (remainingCount > 0) {
        const synonymDistractions = []
        const availableSynonyms = []
        
        for (const word of fromTableWords) {
          const synonyms = wordDatabase.synonyms[word] || []
          for (const syn of synonyms) {
            if (!excludeWords.includes(syn) && !similarDistractions.includes(syn) && !synonymDistractions.includes(syn)) {
              availableSynonyms.push(syn)
            }
          }
        }
        
        const shuffledSynonyms = availableSynonyms.sort(() => Math.random() - 0.5)
        synonymDistractions.push(...shuffledSynonyms.slice(0, Math.min(remainingCount, availableSynonyms.length)))
        
        const finalRemaining = remainingCount - synonymDistractions.length
        if (finalRemaining > 0) {
          const randomDistractions = getDistractionWords(finalRemaining, [...excludeWords, ...similarDistractions, ...synonymDistractions])
          synonymDistractions.push(...randomDistractions)
        }
        
        similarDistractions.push(...synonymDistractions)
      }
      
      distractions.push(...similarDistractions)
    }
    
    return distractions.slice(0, count)
  }
  
  return {
    generateQuestions
  }
}
