import { ref, onUnmounted } from "vue";

export function useTimer() {
  const seconds = ref(0);
  let timer = null;

  function start() {
    if (timer) return;
    timer = setInterval(() => {
      seconds.value++;
    }, 1000);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function reset() {
    stop();
    seconds.value = 0;
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  onUnmounted(() => {
    stop();
  });

  return {
    seconds,
    start,
    stop,
    reset,
    formatTime,
  };
}
