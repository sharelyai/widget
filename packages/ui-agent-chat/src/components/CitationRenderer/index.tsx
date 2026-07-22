import {
  ReactNode,
  Fragment,
  Children,
  isValidElement,
  cloneElement,
  ReactElement,
} from "react";
import type { Source } from "@sharelyai/widget-services";
import { CitationBadge } from "../CitationBadge";

interface CitationRendererProps {
  children: ReactNode;
  sources: Source[];
  onSourceClick?: (sourceId: string) => void;
}

// Matches [N], [N-M] (range), and [N,N,N] (comma-separated) citation patterns
const CITATION_PATTERN = /\[(\d+(?:[,-]\d+)*)\]/g;

// Process a string to replace citation patterns with CitationBadge components
function processString(
  text: string,
  sources: Source[],
  onSourceClick?: (sourceId: string) => void,
  keyPrefix = "",
): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(CITATION_PATTERN);

  while ((match = regex.exec(text)) !== null) {
    // Add text before the citation
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const inner = match[1]; // e.g. "5", "1-6", "5,6", "1,2,3"

    if (inner.includes(",")) {
      // Comma-separated list: [5,6] or [1,2,3]
      const nums = inner.split(",").map((n) => parseInt(n.trim(), 10));
      nums.forEach((num, i) => {
        const source = sources[num - 1];
        if (source) {
          parts.push(
            <CitationBadge
              key={`${keyPrefix}citation-${match!.index}-${num}-${i}`}
              index={num}
              source={source}
              onSourceClick={onSourceClick}
            />,
          );
        }
      });
    } else if (inner.includes("-")) {
      // Range: [1-6] — show first valid source
      const startNum = parseInt(inner.split("-")[0], 10);
      const source = sources[startNum - 1];
      if (source) {
        parts.push(
          <CitationBadge
            key={`${keyPrefix}citation-${match.index}-${startNum}`}
            index={startNum}
            source={source}
            onSourceClick={onSourceClick}
          />,
        );
      } else {
        parts.push(match[0]);
      }
    } else {
      // Single: [1]
      const num = parseInt(inner, 10);
      const source = sources[num - 1];
      if (source) {
        parts.push(
          <CitationBadge
            key={`${keyPrefix}citation-${match.index}-${num}`}
            index={num}
            source={source}
            onSourceClick={onSourceClick}
          />,
        );
      } else {
        parts.push(match[0]);
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last citation
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// Recursively process children to handle nested React elements
function processChildren(
  children: ReactNode,
  sources: Source[],
  onSourceClick?: (sourceId: string) => void,
  keyPrefix = "",
): ReactNode {
  // Handle null/undefined
  if (children == null) {
    return children;
  }

  // Handle strings - this is where we actually replace citations
  if (typeof children === "string") {
    const parts = processString(children, sources, onSourceClick, keyPrefix);
    if (parts.length === 1 && typeof parts[0] === "string") {
      return parts[0];
    }
    return (
      <>
        {parts.map((part, index) =>
          typeof part === "string" ? (
            <Fragment key={`${keyPrefix}text-${index}`}>{part}</Fragment>
          ) : (
            part
          ),
        )}
      </>
    );
  }

  // Handle numbers (render as-is)
  if (typeof children === "number") {
    return children;
  }

  // Handle arrays
  if (Array.isArray(children)) {
    return Children.map(children, (child, index) =>
      processChildren(child, sources, onSourceClick, `${keyPrefix}${index}-`),
    );
  }

  // Handle React elements - recursively process their children
  if (isValidElement(children)) {
    const element = children as ReactElement<{ children?: ReactNode }>;
    const elementChildren = element.props.children;

    if (elementChildren != null) {
      const processedChildren = processChildren(
        elementChildren,
        sources,
        onSourceClick,
        `${keyPrefix}el-`,
      );
      return cloneElement(element, {}, processedChildren);
    }
    return element;
  }

  // Fallback - return as-is
  return children;
}

export function CitationRenderer({
  children,
  sources,
  onSourceClick,
}: CitationRendererProps) {
  // If no sources, just render children as-is
  if (!sources || sources.length === 0) {
    return <>{children}</>;
  }

  return <>{processChildren(children, sources, onSourceClick)}</>;
}

// Custom text component for ReactMarkdown that handles citations
export function createCitationTextComponent(
  sources: Source[],
  onSourceClick?: (sourceId: string) => void,
) {
  return function CitationText({ children }: { children: ReactNode }) {
    return (
      <CitationRenderer sources={sources} onSourceClick={onSourceClick}>
        {children}
      </CitationRenderer>
    );
  };
}

// Returns ReactMarkdown `components` overrides that replace [N] patterns with CitationBadge
export function getCitationMarkdownComponents(
  sources: Source[],
  onSourceClick?: (sourceId: string) => void,
) {
  if (!sources || sources.length === 0) return undefined;

  const CitationText = createCitationTextComponent(sources, onSourceClick);

  const processChildren = (children: ReactNode): ReactNode => {
    if (children == null) return children;
    if (typeof children === "string") {
      return <CitationText>{children}</CitationText>;
    }
    if (Array.isArray(children)) {
      return children.map((child, index) =>
        typeof child === "string" ? (
          <CitationText key={index}>{child}</CitationText>
        ) : (
          child
        ),
      );
    }
    return children;
  };

  return {
    p: ({ children }: { children?: ReactNode }) => (
      <p>{processChildren(children)}</p>
    ),
    li: ({ children }: { children?: ReactNode }) => (
      <li>{processChildren(children)}</li>
    ),
    h1: ({ children }: { children?: ReactNode }) => (
      <h1>{processChildren(children)}</h1>
    ),
    h2: ({ children }: { children?: ReactNode }) => (
      <h2>{processChildren(children)}</h2>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h3>{processChildren(children)}</h3>
    ),
    h4: ({ children }: { children?: ReactNode }) => (
      <h4>{processChildren(children)}</h4>
    ),
    strong: ({ children }: { children?: ReactNode }) => (
      <strong>{processChildren(children)}</strong>
    ),
    em: ({ children }: { children?: ReactNode }) => (
      <em>{processChildren(children)}</em>
    ),
  };
}
