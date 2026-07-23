import { useEffect, useState } from "react";

export const useMaxHeight = (
  height: number,
  greetingListRef?: React.RefObject<HTMLDivElement>,
  messages?: any[],
) => {
  const [maxHeight, setMaxHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const calculateMaxHeight = () => {
    const headerHomeHeight = 80;
    const navbarHomeHeight = 90;
    const AIPreviewContentHeight = 158;
    const inputChat = 96;
    const greetingListHeight = greetingListRef?.current
      ? greetingListRef.current?.offsetHeight
      : 0;

    const calculatedMaxHeight =
      height -
      navbarHomeHeight -
      headerHomeHeight -
      AIPreviewContentHeight -
      greetingListHeight;
    const calculatedViewportHeight =
      height - navbarHomeHeight - headerHomeHeight - inputChat;

    setMaxHeight(calculatedMaxHeight);
    setViewportHeight(calculatedViewportHeight);
  };

  useEffect(() => {
    calculateMaxHeight();
  }, [height, greetingListRef?.current, messages]);

  useEffect(() => {
    const handleResize = () => {
      calculateMaxHeight();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { maxHeight, viewportHeight };
};
