import { useState, useRef, useEffect } from "react";

export default function useTimer(initialSeconds = 10) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [status, setStatus] = useState("idle"); // idle | running | ended
  const timerRef = useRef(null);

  const start = () => {
    if (status === "running") return;
    setStatus("running");
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setStatus("ended");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stop = () => {
    clearInterval(timerRef.current);
    setStatus("idle");
  };

  const reset = () => {
    clearInterval(timerRef.current);
    setTimeLeft(initialSeconds);
    setStatus("idle");
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current); // cleanup on unmount
  }, []);

  return { timeLeft, status, start, stop, reset };
}
