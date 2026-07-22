import { useState } from "react";
import {
  FeedbackWrapper,
  FeedbackTitle,
  FeedbackOptionsRow,
  FeedbackOption,
  FeedbackTextarea,
  FeedbackActions,
  FeedbackBtn,
  FeedbackSuccess,
} from "../styles";
import { CheckCircleIcon } from "../icons";

interface FeedbackPanelProps {
  onSubmit?: (data: { reason: string; detail: string }) => void;
  onCancel?: () => void;
}

const FEEDBACK_OPTIONS = [
  "Incorrect information",
  "Not relevant to my question",
  "Too long or unclear",
  "Other",
];

export function FeedbackPanel({ onSubmit, onCancel }: FeedbackPanelProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <FeedbackSuccess>
        <CheckCircleIcon size={18} />
        Thank you for your feedback.
      </FeedbackSuccess>
    );
  }

  return (
    <FeedbackWrapper>
      <FeedbackTitle>What went wrong?</FeedbackTitle>
      <FeedbackOptionsRow>
        {FEEDBACK_OPTIONS.map((opt) => (
          <FeedbackOption
            key={opt}
            $active={selected === opt}
            onClick={() => setSelected(selected === opt ? null : opt)}
            aria-pressed={selected === opt}
          >
            {opt}
          </FeedbackOption>
        ))}
      </FeedbackOptionsRow>
      {selected && (
        <FeedbackTextarea
          placeholder="Tell us more (optional)"
          aria-label="Additional feedback details"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={2}
        />
      )}
      <FeedbackActions>
        <FeedbackBtn
          $variant="primary"
          disabled={!selected}
          onClick={() => {
            if (selected) {
              onSubmit?.({ reason: selected, detail });
              setSubmitted(true);
            }
          }}
        >
          Submit
        </FeedbackBtn>
        <FeedbackBtn $variant="secondary" onClick={onCancel}>
          Cancel
        </FeedbackBtn>
      </FeedbackActions>
    </FeedbackWrapper>
  );
}
