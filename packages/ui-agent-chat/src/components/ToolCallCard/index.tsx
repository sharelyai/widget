import { useState } from "react";
import type { ToolCall } from "@sharelyai/widget-services";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SpinnerIcon,
  XIcon,
} from "../icons";
import {
  ToolCallWrapper,
  ToolCallHeader,
  ToolCallName,
  ToolCallStatus,
  ToolCallDuration,
  ToolCallDetails,
  ToolCallJson,
} from "../styles";

interface ToolCallCardProps {
  toolCall: ToolCall;
}

function formatToolName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusIcon = {
    running: <SpinnerIcon />,
    completed: <CheckIcon />,
    error: <XIcon />,
  }[toolCall.status];

  return (
    <ToolCallWrapper $error={toolCall.status === "error"}>
      <ToolCallHeader onClick={() => setIsExpanded(!isExpanded)}>
        <ToolCallStatus>{statusIcon}</ToolCallStatus>
        <ToolCallName>{formatToolName(toolCall.name)}</ToolCallName>
        {toolCall.durationMs !== undefined && (
          <ToolCallDuration>
            {(toolCall.durationMs / 1000).toFixed(1)}s
          </ToolCallDuration>
        )}
        <span style={{ marginLeft: "auto", display: "flex" }}>
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </span>
      </ToolCallHeader>

      {isExpanded && (
        <ToolCallDetails>
          <div>
            <h4
              style={{
                fontSize: 12,
                fontWeight: 500,
                marginBottom: 6,
                color: "#667085",
              }}
            >
              Input
            </h4>
            <ToolCallJson>
              {JSON.stringify(toolCall.input, null, 2)}
            </ToolCallJson>
          </div>

          {toolCall.status !== "running" && (
            <div style={{ marginTop: 8 }}>
              <h4
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  marginBottom: 6,
                  color: "#667085",
                }}
              >
                {toolCall.error ? "Error" : "Output"}
              </h4>
              <ToolCallJson>
                {toolCall.error || JSON.stringify(toolCall.output, null, 2)}
              </ToolCallJson>
            </div>
          )}
        </ToolCallDetails>
      )}
    </ToolCallWrapper>
  );
}
