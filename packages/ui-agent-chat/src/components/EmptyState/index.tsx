import { KeyboardEvent, useRef } from "react";
import {
  EmptyStateWrapper,
  EmptyStateGreeting,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateInputSection,
  EmptyStateInputWrapper,
  EmptyStateSendButton,
  EmptyStateNote,
} from "./styles";
import { VersionButton } from "../styles";
import { SendIcon } from "../icons";

interface EmptyStateProps {
  title?: string;
  description?: string;
  disclaimer?: string;
  version?: string;
  onVersionClick?: () => void;
  placeholder?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSubmit?: () => void;
}

export function EmptyState({
  title = "Chat",
  description,
  disclaimer,
  version,
  onVersionClick,
  placeholder = "Ask a question...",
  inputValue = "",
  onInputChange,
  onSubmit,
}: EmptyStateProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const canSend = inputValue.trim().length > 0;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && canSend) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <EmptyStateWrapper>
      <EmptyStateGreeting>
        <EmptyStateTitle>{title}</EmptyStateTitle>
        {description && (
          <EmptyStateDescription>{description}</EmptyStateDescription>
        )}
      </EmptyStateGreeting>
      {onInputChange && (
        <EmptyStateInputSection>
          <EmptyStateInputWrapper>
            <input
              ref={inputRef}
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <EmptyStateSendButton
              $disabled={!canSend}
              onClick={() => canSend && onSubmit?.()}
            >
              <SendIcon size={24} />
            </EmptyStateSendButton>
          </EmptyStateInputWrapper>
        </EmptyStateInputSection>
      )}
      {disclaimer && (
        <EmptyStateNote>
          <span>
            {disclaimer}
            {version && (
              <>
                {" "}
                <VersionButton type="button" onClick={onVersionClick}>
                  (v{version})
                </VersionButton>
              </>
            )}
          </span>
        </EmptyStateNote>
      )}
    </EmptyStateWrapper>
  );
}
