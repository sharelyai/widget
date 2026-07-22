import { useMemo } from "react";
import { ReactMarkdown } from "@sharelyai/widget-ui-shared";
import type { Source } from "@sharelyai/widget-services";
import { getCitationMarkdownComponents } from "../CitationRenderer";

interface AgentMessageContentProps {
  /** Raw message content, including `[N]` citation markers. */
  content: string;
  /** Sources referenced by the `[N]` markers (1-based → sources[N - 1]). */
  sources?: Source[];
  /** Optional handler fired when a citation badge is clicked. */
  onSourceClick?: (sourceId: string) => void;
}

/**
 * Renders agent message markdown with inline citation badges.
 *
 * `[N]`, `[N-M]` and `[N,N]` markers in `content` are replaced by hoverable
 * `CitationBadge`s (the source-preview popover). When there are no sources the
 * content renders as plain markdown. Style comes from the surrounding message
 * container, so this drops into both streaming and settled message bodies.
 */
export function AgentMessageContent({
  content,
  sources,
  onSourceClick,
}: AgentMessageContentProps) {
  const markdownComponents = useMemo(
    () => getCitationMarkdownComponents(sources || [], onSourceClick),
    [sources, onSourceClick],
  );

  return (
    <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
  );
}
