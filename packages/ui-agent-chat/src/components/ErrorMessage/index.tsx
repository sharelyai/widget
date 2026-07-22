import { ErrorCard, ErrorContent, ErrorText, ErrorRetryButton } from "../styles";
import { ErrorOutlineIcon, RefreshIcon } from "../icons";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  message = "We couldn't find an answer. Try rephrasing your question.",
  onRetry,
}: ErrorMessageProps) {
  return (
    <ErrorCard role="alert">
      <ErrorOutlineIcon size={20} />
      <ErrorContent>
        <ErrorText>{message}</ErrorText>
        {onRetry && (
          <ErrorRetryButton onClick={onRetry}>
            <RefreshIcon size={16} />
            Try again
          </ErrorRetryButton>
        )}
      </ErrorContent>
    </ErrorCard>
  );
}
