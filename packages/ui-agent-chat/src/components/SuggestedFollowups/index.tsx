import { FollowupsRow, FollowupButton } from "../styles";
import { ArrowForwardIcon } from "../icons";

interface SuggestedFollowupsProps {
  questions: string[];
  onSelect: (text: string) => void;
}

export function SuggestedFollowups({
  questions,
  onSelect,
}: SuggestedFollowupsProps) {
  if (!questions.length) return null;

  return (
    <FollowupsRow>
      {questions.map((q, i) => (
        <FollowupButton
          key={i}
          onClick={() => onSelect(q)}
          aria-label={`Ask: ${q}`}
        >
          <ArrowForwardIcon size={20} />
          <span>{q}</span>
        </FollowupButton>
      ))}
    </FollowupsRow>
  );
}
