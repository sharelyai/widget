import { useEffect, useRef } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  ThumbsUpFilled,
  ThumbsDownFilled,
  Close,
  Tooltip,
  useCountdown,
} from "@sharelyai/widget-ui-shared";
import { Wrapper } from "./styles";
import { classNames, constants } from "@sharelyai/widget-services";
import { useFeedbackBoxStore } from "./storage";

export interface MessageFeedbackProps {
  messageId: string;
  thumbType?: string;
  feedback?: string;
  isHovered?: boolean;
  isAiMessage?: boolean;
  handleThumbUp: () => void;
  handleThumbDown: () => void;
  handleSendFeedback?: (props: any) => void;
}

export const MessageFeedback = (props: MessageFeedbackProps) => {
  const {
    messageId,
    isAiMessage,
    thumbType,
    isHovered,
    feedback,
    handleThumbUp,
    handleThumbDown,
    handleSendFeedback,
  } = props;

  const {
    shownMessageId,
    showFeedbackBox,
    showThanksBox,
    setFeedbackBox,
    setThanksBox,
  } = useFeedbackBoxStore();

  const isCurrentFeedbackBox = shownMessageId === messageId;
  const refTextArea = useRef<HTMLTextAreaElement>(null);

  const hasToShowFeedback =
    isAiMessage &&
    showFeedbackBox &&
    isCurrentFeedbackBox &&
    Boolean(handleSendFeedback) &&
    Boolean(thumbType);

  useCountdown({
    initialSeconds: 8,
    startCountdown: showThanksBox && isCurrentFeedbackBox,
    onComplete: () => {
      setFeedbackBox(null, false);
      setThanksBox(false);
    },
  });

  useEffect(() => {
    const thumbContainers = document.querySelectorAll(".thumb-container");

    if (thumbContainers[0]) {
      // remove visibility from all thumb containers
      Array.from(thumbContainers).forEach((thumbContainer) => {
        (thumbContainer as HTMLElement)?.style?.removeProperty("visibility");
      });
      // show the first thumb container
      (thumbContainers[0] as HTMLElement).style.visibility = "visible";
    }
  }, []);

  const handleCloseFeedbackBox = () => {
    setFeedbackBox(null, false);
    setThanksBox(false);
  };

  const handleSendFeedbackClick = () => {
    const feedback = refTextArea.current;
    if (feedback) {
      handleSendFeedback &&
        handleSendFeedback({ feedback: feedback.value, messageId });
      setThanksBox(true);
      feedback.value = "";
    }
  };

  const handleOpenFeedbackBox = (service) => {
    if (service === 1) {
      handleThumbUp();
    }
    if (service === 2) {
      handleThumbDown();
    }
    if (!feedback) setFeedbackBox(messageId, true);
  };

  return (
    <Wrapper>
      <div
        className={classNames("thumb-container", {
          hover: isHovered,
        })}
      >
        {isAiMessage && (
          <>
            <Tooltip text="Good response" position="bottom">
              <button
                className={classNames(
                  "sharelyai-webcontroller-thumb-up icon-button",
                  { like: thumbType === constants.THUMB_UP },
                )}
                onClick={() => handleOpenFeedbackBox(1)}
              >
                {thumbType === constants.THUMB_UP ? (
                  <ThumbsUpFilled />
                ) : (
                  <ThumbsUp />
                )}
              </button>
            </Tooltip>
            <Tooltip text="Bad response" position="bottom">
              <button
                className={classNames(
                  "sharelyai-webcontroller-thumb-down icon-button",
                  { unlike: thumbType === constants.THUMB_DOWN },
                )}
                onClick={() => handleOpenFeedbackBox(2)}
              >
                {thumbType === constants.THUMB_DOWN ? (
                  <ThumbsDownFilled />
                ) : (
                  <ThumbsDown />
                )}
              </button>
            </Tooltip>
          </>
        )}
      </div>
      {hasToShowFeedback && (
        <div className="feedback">
          <div className="header">
            {!showThanksBox && (
              <p className="title">Provide feedback (Optional)</p>
            )}
            {showThanksBox && <p className="title">Thanks for your feedback</p>}
            <Tooltip text="Close" position="bottom">
              <button onClick={handleCloseFeedbackBox} className="icon-button">
                <Close />
              </button>
            </Tooltip>
          </div>
          {!showThanksBox && (
            <>
              <div className="body">
                <textarea
                  ref={refTextArea}
                  name="feedback"
                  placeholder="Write your feedback here"
                  maxLength={300}
                  rows={3}
                />
              </div>
              <div className="footer">
                <button className="submit" onClick={handleSendFeedbackClick}>
                  Submit
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Wrapper>
  );
};
