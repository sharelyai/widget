import { useEffect, useState } from "react";

export const useVisualViewport = () => {
  const [viewportSize, setViewportSize] = useState(() => {
    if (typeof window === "undefined" || !window.visualViewport) {
      return { viewportHeight: 0, windowHeight: 0 };
    }
    return {
      viewportHeight: window.visualViewport.height,
      windowHeight: window.innerHeight,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      window.requestAnimationFrame(() => {
        setViewportSize({
          viewportHeight:
            typeof window !== "undefined" && window.visualViewport
              ? window.visualViewport.height
              : 0,
          windowHeight: typeof window !== "undefined" ? window.innerHeight : 0,
        });
      });
    };

    if (typeof window !== "undefined" && window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof window !== "undefined" && window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return viewportSize;
};
