import { useMemo } from "react";
import { ReactMarkdown } from "@sharelyai/widget-ui-shared";
import type { Source } from "@sharelyai/widget-services";
import { ResponseText, Cursor } from "../styles";
import { getCitationMarkdownComponents } from "../CitationRenderer";

interface StreamingContentProps {
  content: string;
  sources?: Source[];
  onSourceClick?: (sourceId: string) => void;
}

export function StreamingContent({
  content,
  sources,
  onSourceClick,
}: StreamingContentProps) {
  const markdownComponents = useMemo(
    () => getCitationMarkdownComponents(sources || [], onSourceClick),
    [sources, onSourceClick],
  );

  return (
    <ResponseText>
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
      <Cursor />
    </ResponseText>
  );
}
