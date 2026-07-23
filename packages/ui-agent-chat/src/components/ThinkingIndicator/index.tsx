import { useState } from "react";
import type {
  ThinkingStep,
  ToolCall,
  Source,
} from "@sharelyai/widget-services";
import {
  extractSourcesFromSemanticSearch,
  extractSourcesFromSearchKnowledge,
  resolveSourceUrl,
  isPreviewOnlySource,
  useSourceDownload,
} from "@sharelyai/widget-services";
import {
  ThinkingToggle,
  ThinkingText,
  ThinkingSpinner,
  ThinkingCard,
  ThinkingTimeline,
  ThinkingTimelineItem,
  ThinkingTimelineIcon,
  ThinkingTimelineContent,
  ThinkingSourceToggle,
  ThinkingSourceList,
  ThinkingSourceChip,
} from "../styles";
import { SourcePreviewModal } from "../SourcePreviewModal";
import { CheckIcon, XIcon, ExpandMoreIcon, LinkIcon } from "../icons";

interface ThinkingIndicatorProps {
  steps: ThinkingStep[];
  toolCalls?: ToolCall[];
  collapsed?: boolean;
  sourceCount?: number;
  elapsed?: number;
  failed?: boolean;
  onSourceClick?: (source: Source) => void;
}

// Format a tool call name for display: "search_knowledge" → "Search Knowledge"
function formatToolName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Extract a short description from tool call input
function getToolSummary(tc: ToolCall): string {
  const label = formatToolName(tc.name);
  const input = tc.input;
  // Show the query/text for search-like tools
  const query =
    (input?.query as string) ||
    (input?.text as string) ||
    (input?.knowledgeId as string);
  if (query) {
    const truncated = query.length > 50 ? query.slice(0, 47) + "..." : query;
    return `${label}: "${truncated}"`;
  }
  return label;
}

// Extract result count from tool output
function getResultInfo(tc: ToolCall): string | null {
  if (tc.status !== "completed" || !tc.output) return null;
  const out = tc.output as Record<string, unknown>;
  if (typeof out.totalResults === "number") {
    return `${out.totalResults} result${out.totalResults !== 1 ? "s" : ""}`;
  }
  if (Array.isArray(out.sources)) {
    return `${out.sources.length} source${out.sources.length !== 1 ? "s" : ""}`;
  }
  if (Array.isArray(out.sourcesMetadata)) {
    return `${out.sourcesMetadata.length} source${
      out.sourcesMetadata.length !== 1 ? "s" : ""
    }`;
  }
  if (out.title) {
    const title = out.title as string;
    return title.length > 40 ? title.slice(0, 37) + "..." : title;
  }
  return null;
}

// Extract the referenced sources from a completed tool call's raw output so
// they can be listed (and linked) beneath the step.
function getToolSources(tc: ToolCall): Source[] {
  if (tc.status !== "completed" || !tc.output) return [];
  const out = tc.output as Record<string, unknown>;
  try {
    if (Array.isArray(out.sourcesMetadata)) {
      return extractSourcesFromSemanticSearch(out.sourcesMetadata as never);
    }
    if (Array.isArray(out.results)) {
      return extractSourcesFromSearchKnowledge(out.results as never);
    }
  } catch {
    return [];
  }
  return [];
}

function truncateSourceTitle(title: string, maxLength = 36): string {
  if (!title) return "Untitled source";
  return title.length > maxLength ? title.slice(0, maxLength - 1) + "…" : title;
}

export function ThinkingIndicator({
  steps,
  toolCalls = [],
  collapsed: initialCollapsed = true,
  sourceCount,
  elapsed,
  failed = false,
  onSourceClick,
}: ThinkingIndicatorProps) {
  const [open, setOpen] = useState(!initialCollapsed);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(
    () => new Set(),
  );
  const [previewSource, setPreviewSource] = useState<Source | null>(null);
  const { downloadSource } = useSourceDownload();

  // Mirror SourcesList's open behaviour so timeline chips actually open:
  // external URL → new tab; preview-only (no URL, no file) → inline modal;
  // otherwise hand to the host, or download the underlying document.
  const handleSourceClick = (source: Source) => {
    const url = resolveSourceUrl(source);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    if (isPreviewOnlySource(source)) {
      setPreviewSource(source);
      return;
    }
    if (onSourceClick) {
      onSourceClick(source);
    } else {
      downloadSource(source);
    }
  };

  const toggleSources = (id: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Use tool calls as timeline items when available, fall back to thinking steps
  const useToolCalls = toolCalls.length > 0;

  const completedCount = useToolCalls
    ? toolCalls.filter((tc) => tc.status === "completed").length
    : steps.filter((s) => s.status === "completed").length;

  const isAllDone = useToolCalls
    ? toolCalls.length > 0 &&
      toolCalls.every((tc) => tc.status !== "running") &&
      steps.every((s) => s.status !== "running")
    : steps.length > 0 && steps.every((s) => s.status !== "running");

  const hasRunning = useToolCalls
    ? toolCalls.some((tc) => tc.status === "running") ||
      steps.some((s) => s.status === "running")
    : steps.some((s) => s.status === "running");

  if (steps.length === 0 && toolCalls.length === 0) return null;

  // Show the last running tool's full summary, or the last completed one
  const runningTool = [...toolCalls]
    .reverse()
    .find((tc) => tc.status === "running");
  const lastTool =
    runningTool ||
    [...toolCalls].reverse().find((tc) => tc.status === "completed");

  const statusText = failed
    ? "Couldn't complete search"
    : isAllDone
      ? sourceCount !== undefined
        ? `Answered from ${sourceCount} sources`
        : `Completed ${completedCount} steps`
      : useToolCalls && lastTool
        ? getToolSummary(lastTool) + (runningTool ? "..." : "")
        : steps.find((s) => s.status === "running")?.title || "Processing...";

  return (
    <div>
      <ThinkingToggle
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        aria-expanded={open}
        aria-label={`${statusText}. Click to see details.`}
      >
        <ThinkingText
          key={failed ? "fail" : isAllDone ? "done" : completedCount}
          style={failed ? { color: "#F04438" } : undefined}
        >
          {statusText}
        </ThinkingText>
        {hasRunning && !failed && <ThinkingSpinner />}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {hasRunning && !failed && elapsed !== undefined && elapsed > 2 && (
            <span style={{ fontSize: 14, color: "#98A2B3" }}>{elapsed}s</span>
          )}
          <ExpandMoreIcon
            size={22}
            style={{
              color: "#98A2B3",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </div>
      </ThinkingToggle>

      {open && (
        <ThinkingCard role="list" aria-label="Processing steps">
          <ThinkingTimeline>
            {useToolCalls
              ? toolCalls.map((tc) => {
                  const isCompleted = tc.status === "completed";
                  const isRunning = tc.status === "running";
                  const isError = tc.status === "error";
                  const resultInfo = getResultInfo(tc);
                  const sources = getToolSources(tc);
                  const sourcesOpen = expandedSources.has(tc.id);

                  return (
                    <ThinkingTimelineItem key={tc.id} role="listitem">
                      <ThinkingTimelineIcon>
                        {isCompleted ? (
                          <CheckIcon size={18} style={{ color: "#12B76A" }} />
                        ) : isRunning ? (
                          <ThinkingSpinner style={{ width: 14, height: 14 }} />
                        ) : isError ? (
                          <XIcon size={18} style={{ color: "#F04438" }} />
                        ) : (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#D0D5DD",
                            }}
                          />
                        )}
                      </ThinkingTimelineIcon>
                      <ThinkingTimelineContent>
                        <span
                          style={{
                            fontSize: 14,
                            color: isCompleted
                              ? "#344054"
                              : isError
                                ? "#F04438"
                                : "#667085",
                          }}
                        >
                          {getToolSummary(tc)}
                          {resultInfo && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 12,
                                color: "#98A2B3",
                              }}
                            >
                              → {resultInfo}
                            </span>
                          )}
                          {tc.durationMs !== undefined && isCompleted && (
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 12,
                                color: "#98A2B3",
                              }}
                            >
                              {(tc.durationMs / 1000).toFixed(1)}s
                            </span>
                          )}
                          {sources.length > 0 && (
                            <ThinkingSourceToggle
                              type="button"
                              onClick={() => toggleSources(tc.id)}
                              aria-expanded={sourcesOpen}
                              aria-label={`${sourcesOpen ? "Hide" : "View"} ${
                                sources.length
                              } source${sources.length !== 1 ? "s" : ""}`}
                            >
                              {sourcesOpen ? "Hide" : "View"} sources
                              <ExpandMoreIcon
                                size={16}
                                style={{
                                  transform: sourcesOpen
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                  transition: "transform 0.2s ease",
                                }}
                              />
                            </ThinkingSourceToggle>
                          )}
                        </span>
                        {sourcesOpen && sources.length > 0 && (
                          <ThinkingSourceList>
                            {sources.map((source, idx) => (
                              <ThinkingSourceChip
                                key={`${source.id}-${idx}`}
                                as="button"
                                type="button"
                                $clickable
                                onClick={() => handleSourceClick(source)}
                                title={source.title || undefined}
                              >
                                <LinkIcon size={12} />
                                <span>{truncateSourceTitle(source.title)}</span>
                              </ThinkingSourceChip>
                            ))}
                          </ThinkingSourceList>
                        )}
                      </ThinkingTimelineContent>
                    </ThinkingTimelineItem>
                  );
                })
              : steps.map((step) => {
                  const isCompleted = step.status === "completed";
                  const isRunning = step.status === "running";
                  const isFailed = step.status === "failed";

                  return (
                    <ThinkingTimelineItem key={step.id} role="listitem">
                      <ThinkingTimelineIcon>
                        {isCompleted ? (
                          <CheckIcon size={18} style={{ color: "#12B76A" }} />
                        ) : isRunning ? (
                          <ThinkingSpinner style={{ width: 14, height: 14 }} />
                        ) : isFailed ? (
                          <XIcon size={18} style={{ color: "#F04438" }} />
                        ) : (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#D0D5DD",
                            }}
                          />
                        )}
                      </ThinkingTimelineIcon>
                      <span
                        style={{
                          fontSize: 14,
                          color: isCompleted
                            ? "#344054"
                            : isFailed
                              ? "#F04438"
                              : "#667085",
                        }}
                      >
                        {step.title}
                        {step.durationMs !== undefined && isCompleted && (
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: 12,
                              color: "#98A2B3",
                            }}
                          >
                            {(step.durationMs / 1000).toFixed(1)}s
                          </span>
                        )}
                      </span>
                    </ThinkingTimelineItem>
                  );
                })}
          </ThinkingTimeline>
        </ThinkingCard>
      )}
      <SourcePreviewModal
        open={previewSource !== null}
        source={previewSource}
        onClose={() => setPreviewSource(null)}
      />
    </div>
  );
}
