import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useWordGenerator } from "../composables/useWordGenerator.js";
import { useQuestionGenerator } from "../composables/useQuestionGenerator.js";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001/api";

export const useTrainingStore = defineStore("training", () => {
  const difficulty = ref("medium");
  const isTraining = ref(false);
  const tableWords = ref([]);
  const questions = ref([]);
  const currentQuestion = ref(1);
  const selectedAnswers = ref(Array(10).fill(null));
  const questionTimes = ref(Array(10).fill(0));
  const totalTime = ref(0);
  const markedQuestions = ref(new Set());
  const results = ref(null);
  const showResultModal = ref(false);

  let totalTimer = null;

  const answeredCount = computed(
    () => selectedAnswers.value.filter((a) => a !== null).length,
  );

  const { generateTableWords } = useWordGenerator();
  const { generateQuestions } = useQuestionGenerator();

  function startTraining() {
    tableWords.value = generateTableWords();
    questions.value = generateQuestions(tableWords.value, difficulty.value);
    selectedAnswers.value = Array(10).fill(null);
    questionTimes.value = Array(10).fill(0);
    totalTime.value = 0;
    currentQuestion.value = 1;
    markedQuestions.value = new Set();
    results.value = null;
    isTraining.value = true;

    if (totalTimer) clearInterval(totalTimer);
    totalTimer = setInterval(() => {
      totalTime.value++;
    }, 1000);
  }

  function stopTimer() {
    if (totalTimer) {
      clearInterval(totalTimer);
      totalTimer = null;
    }
  }

  function navigateTo(n) {
    if (n < 1 || n > 10) return;
    currentQuestion.value = n;
  }

  function prevQuestion() {
    if (currentQuestion.value > 1) {
      navigateTo(currentQuestion.value - 1);
    }
  }

  function nextQuestion() {
    if (currentQuestion.value < 10) {
      navigateTo(currentQuestion.value + 1);
    }
  }

  function selectAnswer(index, value) {
    selectedAnswers.value[index] = value;
  }

  function toggleMark(n) {
    if (markedQuestions.value.has(n)) {
      markedQuestions.value.delete(n);
    } else {
      markedQuestions.value.add(n);
    }
  }

  async function submitTraining(userId) {
    stopTimer();

    let correctCount = 0;
    const details = questions.value.map((q, index) => {
      const isCorrect = selectedAnswers.value[index] === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionIndex: index,
        questionWords: q.words,
        userAnswer: selectedAnswers.value[index],
        correctAnswer: q.correctAnswer,
        isCorrect,
        timeSpent: questionTimes.value[index],
      };
    });

    results.value = {
      correctCount,
      totalCount: 10,
      accuracy: ((correctCount / 10) * 100).toFixed(1),
      avgTime: (totalTime.value / 10).toFixed(1),
      details,
    };

    if (userId) {
      try {
        await fetch(`${API_BASE}/training/record`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            difficulty: difficulty.value,
            tableWords: tableWords.value,
            accuracy: parseFloat(results.value.accuracy),
            correctCount: results.value.correctCount,
            totalTime: totalTime.value,
            avgTime: parseFloat(results.value.avgTime),
            details,
          }),
        });
      } catch (error) {
        console.error("Failed to save training record:", error);
      }
    }

    showResultModal.value = true;
    return results.value;
  }

  function resetTraining() {
    stopTimer();
    isTraining.value = false;
    showResultModal.value = false;
    results.value = null;
    tableWords.value = [];
    questions.value = [];
    selectedAnswers.value = Array(10).fill(null);
    totalTime.value = 0;
    currentQuestion.value = 1;
    markedQuestions.value = new Set();
  }

  return {
    difficulty,
    isTraining,
    tableWords,
    questions,
    currentQuestion,
    selectedAnswers,
    questionTimes,
    totalTime,
    markedQuestions,
    results,
    showResultModal,
    answeredCount,
    startTraining,
    stopTimer,
    navigateTo,
    prevQuestion,
    nextQuestion,
    selectAnswer,
    toggleMark,
    submitTraining,
    resetTraining,
  };
});
