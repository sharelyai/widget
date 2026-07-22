import { useRef, useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

interface IProps {
  children: ReactNode;
  selector?: string;
}

export const Portal = (props: IProps) => {
  const { children, selector = "#modal" } = props;
  const ref = useRef<HTMLElement | null>(null); // Explicitly type useRef
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const element = document.querySelector<HTMLElement>(selector); // Specify type parameter for querySelector
    if (element) {
      ref.current = element;
      setMounted(true);
    } else {
      console.warn(`Portal: Element with selector "${selector}" not found.`);
      setMounted(false); // Do not mount if element not found
    }
  }, [selector]);

  // Only render portal if mounted and ref.current is not null
  return mounted && ref.current ? createPortal(<>{children}</>, ref.current) : null;
};