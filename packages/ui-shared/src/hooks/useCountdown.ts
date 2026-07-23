import { useState, useEffect, useRef } from "react";

interface IProps {
  initialSeconds: number;
  startCountdown: boolean;
  onComplete: () => void;
}

export const useCountdown = ({
  initialSeconds,
  startCountdown,
  onComplete,
}: IProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const hasCompleted = useRef(false);

  useEffect(() => {
    let timer: number | null = null; // Changed NodeJS.Timeout to number

    if (startCountdown && seconds > 0) {
      hasCompleted.current = false;
      timer = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds <= 1) {
            clearInterval(timer!);
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (seconds === 0 && !hasCompleted.current) {
      hasCompleted.current = true;
      onComplete();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [startCountdown, seconds, onComplete]);

  useEffect(() => {
    if (!startCountdown) {
      setSeconds(initialSeconds);
      hasCompleted.current = false;
    }
  }, [startCountdown, initialSeconds]);

  return seconds;
};
