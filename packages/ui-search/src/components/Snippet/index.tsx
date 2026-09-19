/**
 * Highlighted excerpt for lexical search hits.
 *
 * The backend returns the matched chunk with `<mark>` tags around the query
 * terms (Postgres `ts_headline`). The string is split into text segments and
 * rendered as text nodes, so nothing from the stored content reaches the DOM
 * as HTML; only the `<mark>` elements are created here.
 */
import styled, { css } from "styled-components";

import { snippetToSegments } from "@sharelyai/widget-services";

const Mark = styled.mark`
  ${({ theme }: { theme: any }) => css`
    background: ${theme.colors.beeswax};
    color: inherit;
    font-weight: 600;
    border-radius: 2px;
  `}
`;

type ComponentProps = {
  snippet?: string | null;
  className?: string;
};

export const Snippet = ({ snippet, className }: ComponentProps) => {
  const segments = snippetToSegments(snippet);
  if (segments.length === 0) return null;

  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <Mark key={index}>{segment.text}</Mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  );
};
