import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";
import styled, { css } from "styled-components";

interface TooltipProps {
  children: ReactNode;
  text: string;
  placement?: "top" | "bottom" | "left" | "right";
}

const TooltipContent = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.colors.ebony};
    color: ${theme.colors.white};
    padding: 4px 8px;
    border-radius: 4px;
    font-size: ${theme.fonts.xs};
    z-index: 10000;
    pointer-events: none;
  `}
`;

export const Tooltip = ({
  children,
  text,
  placement = "top",
}: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const mountedRef = useRef(true);
  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  // Guard against setState during React commit phase (floating-ui ref cleanup)
  const handleOpenChange = useCallback((open: boolean) => {
    if (mountedRef.current) setIsOpen(open);
  }, []);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: handleOpenChange,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip({
        fallbackAxisSideDirection: "start",
      }),
      shift(),
    ],
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const floatingRefs = useRef(refs);
  floatingRefs.current = refs;
  const safeSetReference = useCallback((node: HTMLElement | null) => {
    floatingRefs.current.setReference(node);
  }, []);
  const safeSetFloating = useCallback((node: HTMLElement | null) => {
    floatingRefs.current.setFloating(node);
  }, []);

  return (
    <>
      <div
        ref={safeSetReference}
        {...getReferenceProps()}
        style={{ display: "inline-block" }}
      >
        {children}
      </div>
      {isOpen && (
        <FloatingPortal>
          <TooltipContent
            ref={safeSetFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {text}
          </TooltipContent>
        </FloatingPortal>
      )}
    </>
  );
};
