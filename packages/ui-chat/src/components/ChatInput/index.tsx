import { KeyboardEvent } from "react";
import { ArrowUpward, Person } from "@sharelyai/widget-ui-shared";
import { classNames } from "@sharelyai/widget-services";
import { Wrapper } from "./styles";

export interface ChatInputProps {
  message: string;
  onChange: (message: string) => void;
  onSend: () => void;
  isLoading: boolean;
  placeholder?: string;
  showPersonIcon?: boolean;
  disabled?: boolean;
}

export const ChatInput = (props: ChatInputProps) => {
  const {
    message,
    onChange,
    onSend,
    isLoading,
    placeholder,
    showPersonIcon = true,
    disabled = false,
  } = props;

  const isDisabled = isLoading || !message.trim();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Wrapper>
      <div className="sharelyai-webcontroller-content-input-container">
        <div
          className={classNames("sharelyai-webcontroller-content-input", {
            "sharelyai-webcontroller-disabled": disabled,
            "sharelyai-webcontroller-icon-disabled": isDisabled,
          })}
        >
          {showPersonIcon ? (
            <div className="sharelyai-webcontroller-image-user">
              <Person />
            </div>
          ) : (
            <span />
          )}
          <input
            type="text"
            placeholder={placeholder}
            value={message}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
          <div
            className={classNames(
              "sharelyai-webcontroller-content-input-icon",
              {
                disabled: isDisabled,
              },
            )}
            onClick={() => {
              if (!isDisabled) onSend();
            }}
          >
            <ArrowUpward />
          </div>
        </div>
      </div>
    </Wrapper>
  );
};
