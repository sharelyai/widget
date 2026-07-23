/**
 * Styled components for the agent chat UI, grouped by the sub-component they
 * dress. Section map (search for the banner comments to jump):
 *
 *   - Keyframe Animations     spin / fadeIn / cursorBlink (shared by many below)
 *   - Chat shell              ChatWrapper, ChatHeader, ChatArea, MessagesContainer
 *   - Messages                UserBubble, AiRow, Avatar, AiContent, ResponseText
 *   - Thinking indicator      ThinkingToggle, ThinkingCard, ThinkingTimeline*
 *   - Citations               CiteButton, CitePopover*
 *   - Sources                 SourcesSection, SourceChip*, SourceMoreChip
 *   - Action bar              ActionBarWrapper, IconBtn
 *   - Feedback                FeedbackWrapper, FeedbackOption*, FeedbackBtn
 *   - Followups               FollowupsRow, FollowupButton
 *   - Input                   InputArea, InputRow, InputField, SendButton
 *   - Error                   ErrorCard, ErrorIcon, ErrorRetryButton
 *   - History modal           ModalBackdrop, ModalContainer, ModalThreadItem
 *   - Streaming               StreamingWrapper, Cursor
 *   - Tool calls              ToolCallWrapper, ToolCallHeader, ToolCallJson
 *
 * If this keeps growing, the clean split is one file per group under a `styles/`
 * directory re-exported from an `index.ts` barrel (keyframes shared via their
 * own module) — importers use `./styles`, so no call sites would change.
 */
import styled, { css, keyframes } from "styled-components";

// ─── Keyframe Animations ────────────────────────────────────────────────────────

export const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const cursorBlink = keyframes`
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
`;

// ─── Layout Components ──────────────────────────────────────────────────────────

export const ChatWrapper = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${theme.colors.white};
    font-family: inherit;
  `}
`;

export const ChatHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid ${theme.colors.athensGray4};
    background: ${theme.colors.white};
  `}
`;

export const ChatArea = styled.div`
  ${({ theme }) => css`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: ${theme.colors.mischka};
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: ${theme.colors.gullGray};
    }
  `}
`;

export const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 20px;
`;

// ─── Message Components ─────────────────────────────────────────────────────────

export const UserBubble = styled.div`
  ${({ theme }) => css`
    background: ${theme.colors.athensGray};
    padding: 12px 16px;
    border-radius: 16px 16px 4px 16px;
    max-width: 85%;
    align-self: flex-end;
    font-size: ${theme.fonts.sm};
    color: ${theme.colors.OxfordBlue};
    line-height: 1.5;
    word-break: break-word;
  `}
`;

export const AiRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: flex-start;
  align-self: flex-start;
  width: 100%;
`;

export const Avatar = styled.div`
  ${({ theme }) => css`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
    overflow: hidden;
    background: ${theme.colors.athensGray3};
    border: 1px solid ${theme.colors.athensGray4};
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `}
`;

export const AiContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

export const ResponseText = styled.div`
  ${({ theme }) => css`
    font-size: ${theme.fonts.sm};
    line-height: 1.7;
    color: ${theme.colors.OxfordBlue};
    word-break: break-word;

    h1,
    h2 {
      font-size: 1.25em;
      font-weight: 600;
      margin: 20px 0 8px;
      color: ${theme.colors.ebony};

      &:first-child {
        margin-top: 0;
      }
    }

    h3,
    h4,
    h5,
    h6 {
      font-size: 1.1em;
      font-weight: 600;
      margin: 16px 0 6px;
      color: ${theme.colors.ebony};

      &:first-child {
        margin-top: 0;
      }
    }

    p {
      margin: 0 0 10px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    ul,
    ol {
      margin: 4px 0 10px;
      padding-left: 24px;
    }

    li {
      margin-bottom: 4px;
    }

    strong {
      font-weight: 600;
      color: ${theme.colors.ebony};
    }

    code {
      background: ${theme.colors.athensGray};
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.92em;
    }

    pre {
      background: ${theme.colors.mirage};
      color: ${theme.colors.athensGray3};
      padding: 14px 16px;
      border-radius: 10px;
      overflow-x: auto;
      margin: 10px 0;

      code {
        background: none;
        padding: 0;
        font-size: inherit;
      }
    }

    blockquote {
      margin: 8px 0;
      padding-left: 12px;
      border-left: 3px solid ${theme.colors.mischka};
      color: ${theme.colors.paleSky};
    }
  `}
`;

// ─── Thinking Components ────────────────────────────────────────────────────────

export const ThinkingToggle = styled.button`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 20px;
    background: ${theme.colors.athensGray};
    cursor: pointer;
    transition: background 0.15s;
    border: none;
    font-family: inherit;

    &:hover {
      background: ${theme.colors.athensGray4};
    }
  `}
`;

export const ThinkingText = styled.span`
  ${({ theme }) => css`
    font-size: 13px;
    font-weight: 500;
    color: ${theme.colors.paleSky};
    animation: ${fadeIn} 0.3s ease;
  `}
`;

export const ThinkingSpinner = styled.span`
  ${({ theme }) => css`
    width: 16px;
    height: 16px;
    border: 2px solid ${theme.colors.athensGray4};
    border-top-color: var(
      --web-control-styles-main_color,
      ${theme.colors.mediumPurple}
    );
    border-radius: 50%;
    animation: ${spin} 0.7s linear infinite;
    display: inline-block;
    box-sizing: border-box;
  `}
`;

export const ThinkingCard = styled.div`
  ${({ theme }) => css`
    margin-top: 8px;
    padding: 12px 16px;
    background: ${theme.colors.white};
    border-radius: 12px;
    border: 1px solid ${theme.colors.athensGray4};
  `}
`;

export const ThinkingTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
`;

export const ThinkingTimelineItem = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
    padding: 6px 0;
    font-size: 13px;
    color: ${theme.colors.paleSky};
    position: relative;

    /* Connector rail: runs from this icon's center (6px padding + 9px half-icon)
       straight down to the next icon's center. height:100% equals this row's
       full height, which is exactly the distance between the two icon centers,
       so the rail stays aligned no matter how many lines a row wraps to. */
    &::before {
      content: "";
      position: absolute;
      left: 9px;
      top: 15px;
      width: 1px;
      height: 100%;
      background: ${theme.colors.athensGray4};
    }

    &:last-child::before {
      display: none;
    }
  `}
`;

export const ThinkingTimelineIcon = styled.span`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

// Column wrapper for a timeline item's text + its expandable source chips.
export const ThinkingTimelineContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
`;

export const ThinkingSourceToggle = styled.button`
  ${({ theme }) => css`
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-left: 8px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    color: var(--web-control-styles-main_color, ${theme.colors.mediumPurple});

    &:hover {
      text-decoration: underline;
    }
  `}
`;

export const ThinkingSourceList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 2px;
`;

export const ThinkingSourceChip = styled.a<{ $clickable: boolean }>`
  ${({ theme, $clickable }) => css`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    max-width: 240px;
    padding: 3px 8px;
    border-radius: 8px;
    border: 1px solid ${theme.colors.athensGray4};
    background: ${theme.colors.athensGray3};
    font-family: inherit;
    font-size: 12px;
    line-height: 1.4;
    color: ${theme.colors.paleSky};
    text-align: left;
    text-decoration: none;
    cursor: ${$clickable ? "pointer" : "default"};

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    ${
      $clickable &&
      css`
        &:hover {
          border-color: ${theme.colors.mischka};
          color: ${theme.colors.OxfordBlue};
        }
      `
    }
  `}
`;

// ─── Citation Components ────────────────────────────────────────────────────────

export const CiteButton = styled.button`
  ${({ theme }) => css`
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;
    font-weight: 500;
    color: var(--web-control-styles-main_color, ${theme.colors.mediumPurple});
    cursor: pointer;
    padding: 1px 6px;
    border-radius: 10px;
    background: transparent;
    border: 1px solid
      color-mix(
        in srgb,
        var(--web-control-styles-main_color, ${theme.colors.mediumPurple}) 30%,
        transparent
      );
    transition: all 0.15s;
    font-family: inherit;

    &:hover {
      background: color-mix(
        in srgb,
        var(--web-control-styles-main_color, ${theme.colors.mediumPurple}) 8%,
        transparent
      );
    }
  `}
`;

export const CitePopover = styled.div`
  ${({ theme }) => css`
    position: absolute;
    z-index: 100;
    min-width: 260px;
    max-width: 340px;
    background: ${theme.colors.white};
    border-radius: 12px;
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.12),
      0 1px 4px rgba(0, 0, 0, 0.08);
    padding: 14px 16px;
    animation: ${fadeIn} 0.3s ease;
  `}
`;

export const CitePopoverHeader = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
`;

export const CiteTypeIcon = styled.div`
  ${({ theme }) => css`
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: ${theme.colors.athensGray3};
  `}
`;

export const CitePopoverTitle = styled.div`
  ${({ theme }) => css`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.colors.ebony};
  `}
`;

export const CitePopoverSnippet = styled.div`
  ${({ theme }) => css`
    font-size: 13px;
    color: ${theme.colors.paleSky};
    line-height: 1.5;
    max-height: 80px;
    overflow: hidden;
  `}
`;

export const CitePopoverFooter = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 10px;
    font-size: 12px;
    color: ${theme.colors.paleSky};
  `}
`;

// ─── Source Components ──────────────────────────────────────────────────────────

export const SourcesSection = styled.div`
  margin-top: 8px;
`;

export const SourcesSectionLabel = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
    color: ${theme.colors.paleSky};
    margin-bottom: 8px;
  `}
`;

export const SourceChipsRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
`;

export const SourceChipButton = styled.button`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid ${theme.colors.athensGray4};
    background: ${theme.colors.white};
    cursor: pointer;
    font-size: 13px;
    color: ${theme.colors.OxfordBlue};
    transition: all 0.15s;
    max-width: 220px;
    font-family: inherit;

    &:hover {
      border-color: ${theme.colors.mischka};
      background: ${theme.colors.athensGray3};
    }
  `}
`;

export const SourceChipTitle = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SourceChipRelevance = styled.span`
  ${({ theme }) => css`
    font-size: 11px;
    color: ${theme.colors.paleSky};
    flex-shrink: 0;
  `}
`;

export const SourceMoreChip = styled.button`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid ${theme.colors.athensGray4};
    background: ${theme.colors.athensGray3};
    cursor: pointer;
    font-size: 13px;
    color: ${theme.colors.paleSky};
    transition: all 0.15s;
    font-family: inherit;

    &:hover {
      border-color: ${theme.colors.mischka};
      background: ${theme.colors.athensGray4};
    }
  `}
`;

// ─── Action Bar ─────────────────────────────────────────────────────────────────

export const ActionBarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2px;
  margin-top: 4px;
  animation: ${fadeIn} 0.3s ease;
`;

export const IconBtn = styled.button<{ $active?: boolean }>`
  ${({ theme, $active }) => css`
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: ${theme.colors.paleSky};
    transition: all 0.15s;
    padding: 0;

    &:hover {
      background: ${theme.colors.athensGray};
      color: ${theme.colors.OxfordBlue};
    }

    ${
      $active &&
      css`
        color: var(
          --web-control-styles-main_color,
          ${theme.colors.mediumPurple}
        );
      `
    }
  `}
`;

// ─── Feedback Panel ─────────────────────────────────────────────────────────────

export const FeedbackWrapper = styled.div`
  ${({ theme }) => css`
    padding: 14px 16px;
    background: ${theme.colors.athensGray3};
    border-radius: 12px;
    margin-top: 8px;
    animation: ${fadeIn} 0.3s ease;
  `}
`;

export const FeedbackTitle = styled.div`
  ${({ theme }) => css`
    font-size: 14px;
    font-weight: 500;
    color: ${theme.colors.ebony};
    margin-bottom: 10px;
  `}
`;

export const FeedbackOptionsRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

export const FeedbackOption = styled.button<{ $active?: boolean }>`
  ${({ theme, $active }) => css`
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid ${theme.colors.mischka};
    background: ${theme.colors.white};
    font-size: 13px;
    color: ${theme.colors.OxfordBlue};
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;

    ${
      $active &&
      css`
        border-color: var(
          --web-control-styles-main_color,
          ${theme.colors.mediumPurple}
        );
        background: color-mix(
          in srgb,
          var(--web-control-styles-main_color, ${theme.colors.mediumPurple}) 6%,
          transparent
        );
        color: var(
          --web-control-styles-main_color,
          ${theme.colors.mediumPurple}
        );
      `
    }
  `}
`;

export const FeedbackTextarea = styled.textarea`
  ${({ theme }) => css`
    width: 100%;
    min-height: 72px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid ${theme.colors.mischka};
    font-size: 13px;
    font-family: inherit;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
    color: ${theme.colors.ebony};

    &:focus {
      border-color: var(
        --web-control-styles-main_color,
        ${theme.colors.mediumPurple}
      );
    }

    &::placeholder {
      color: ${theme.colors.gullGray};
    }
  `}
`;

export const FeedbackActions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
`;

export const FeedbackBtn = styled.button<{
  $variant?: "primary" | "secondary";
}>`
  ${({ theme, $variant = "primary" }) => css`
    padding: 7px 18px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;

    ${
      $variant === "primary" &&
      css`
        background: var(
          --web-control-styles-main_color,
          ${theme.colors.mediumPurple}
        );
        color: ${theme.colors.white};
        border: none;

        &:hover {
          opacity: 0.9;
        }
      `
    }

    ${
      $variant === "secondary" &&
      css`
        background: transparent;
        color: ${theme.colors.paleSky};
        border: 1px solid ${theme.colors.mischka};

        &:hover {
          background: ${theme.colors.athensGray3};
        }
      `
    }
  `}
`;

export const FeedbackSuccess = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: ${theme.colors.mountainMeadow};
    font-weight: 500;
    animation: ${fadeIn} 0.3s ease;
  `}
`;

// ─── Suggested Followups ────────────────────────────────────────────────────────

export const FollowupsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
`;

export const FollowupButton = styled.button`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid ${theme.colors.athensGray4};
    background: ${theme.colors.white};
    cursor: pointer;
    font-size: 13px;
    color: ${theme.colors.OxfordBlue};
    text-align: left;
    transition: all 0.15s;
    font-family: inherit;
    width: 100%;

    &:hover {
      border-color: ${theme.colors.mischka};
      background: ${theme.colors.athensGray3};
    }
  `}
`;

// ─── Input Area ─────────────────────────────────────────────────────────────────

export const InputArea = styled.div`
  ${({ theme }) => css`
    padding: 20px;
    padding-top: 12px;
    background: ${theme.colors.white};
  `}
`;

export const InputRow = styled.div`
  ${({ theme }) => css`
    border-radius: 50px;
    border: 1px solid ${theme.colors.athensGray2};
    background-color: ${theme.colors.white};
    display: grid;
    align-items: center;
    grid-template-columns: 1fr auto;
    grid-gap: 16px;
    padding: 12px;
    width: 100%;
    transition: border-color 0.15s;

    &:focus-within {
      border: 1px solid
        var(--web-control-styles-main_color, ${theme.colors.indigo});
    }
  `}
`;

export const InputField = styled.textarea`
  ${({ theme }) => css`
    border: none;
    outline: none;
    font-size: ${theme.fonts.base};
    font-family: inherit;
    font-style: normal;
    font-weight: 500;
    line-height: 20px;
    resize: none;
    min-height: 20px;
    max-height: 120px;
    color: ${theme.colors.ebony};
    background: transparent;

    &::placeholder {
      color: ${theme.colors.gullGray};
    }

    &:disabled {
      background-color: ${theme.colors.white};
      color: ${theme.colors.paleSky};
    }
  `}
`;

export const SendButton = styled.button<{ $variant?: "danger" }>`
  ${({ theme, $variant }) => css`
    width: 40px;
    height: 40px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
    padding: 8px;

    background: var(--web-control-styles-main_color, ${theme.colors.indigo});
    color: ${theme.colors.white};

    ${
      $variant === "danger" &&
      css`
        background: ${theme.colors.flamingo};
      `
    }

    &:disabled {
      background-color: ${theme.colors.athensGray3};
      cursor: default;

      svg {
        fill: ${theme.colors.gullGray};
      }
    }
  `}
`;

export const DisclaimerText = styled.div`
  ${({ theme }) => css`
    text-align: center;
    font-size: ${theme.fonts.sm};
    font-style: italic;
    color: ${theme.colors.paleSky};
    font-weight: 500;
    margin-top: 8px;
  `}
`;

// Looks like inline text but is a real, focusable button. Inherits the
// surrounding disclaimer typography so it blends into the note.
export const VersionButton = styled.button`
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

// ─── Error Components ───────────────────────────────────────────────────────────

export const ErrorCard = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: 12px;
    padding: 14px 16px;
    background: color-mix(in srgb, ${theme.colors.flamingo} 6%, transparent);
    border-radius: 12px;
    border: 1px solid
      color-mix(in srgb, ${theme.colors.flamingo} 20%, transparent);
  `}
`;

export const ErrorIcon = styled.div`
  ${({ theme }) => css`
    color: ${theme.colors.flamingo};
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
  `}
`;

export const ErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ErrorText = styled.div`
  ${({ theme }) => css`
    font-size: ${theme.fonts.sm};
    color: ${theme.colors.flamingo};
  `}
`;

export const ErrorRetryButton = styled.button`
  ${({ theme }) => css`
    align-self: flex-start;
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid
      color-mix(in srgb, ${theme.colors.flamingo} 30%, transparent);
    background: transparent;
    color: ${theme.colors.flamingo};
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;

    &:hover {
      background: color-mix(in srgb, ${theme.colors.flamingo} 8%, transparent);
    }
  `}
`;

// ─── Modal Components ───────────────────────────────────────────────────────────

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`;

export const ModalContainer = styled.div<{ $overlay?: boolean }>`
  ${({ theme, $overlay }) => css`
    display: flex;
    flex-direction: column;
    background: ${theme.colors.white};
    animation: ${fadeIn} 0.3s ease;

    ${
      $overlay
        ? css`
            position: absolute;
            inset: 0;
            z-index: 10;
          `
        : css`
            position: fixed;
            inset: 0;
            z-index: 1001;
          `
    }
  `}
`;

export const ModalHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid ${theme.colors.athensGray4};
  `}
`;

export const ModalTitle = styled.div`
  ${({ theme }) => css`
    font-size: ${theme.fonts.base};
    font-weight: 600;
    color: ${theme.colors.ebony};
  `}
`;

export const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
`;

export const ModalDateGroup = styled.div`
  ${({ theme }) => css`
    font-size: 12px;
    font-weight: 500;
    color: ${theme.colors.paleSky};
    padding: 12px 0 6px;
    text-transform: uppercase;
  `}
`;

export const ModalThreadItem = styled.div<{ $active?: boolean }>`
  ${({ theme, $active }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
    font-size: ${theme.fonts.sm};
    color: ${theme.colors.OxfordBlue};

    &:hover {
      background: ${theme.colors.athensGray3};
    }

    ${
      $active &&
      css`
        background: ${theme.colors.athensGray3};
        font-weight: 500;
      `
    }
  `}
`;

export const ModalNewChatButton = styled.button`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: 8px;
    width: calc(100% - 32px);
    margin: 8px 16px;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid ${theme.colors.athensGray4};
    background: ${theme.colors.white};
    font-size: ${theme.fonts.sm};
    font-weight: 500;
    color: ${theme.colors.OxfordBlue};
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;

    &:hover {
      background: ${theme.colors.athensGray3};
    }
  `}
`;

// ─── Streaming ──────────────────────────────────────────────────────────────────

export const StreamingWrapper = styled.div`
  ${({ theme }) => css`
    font-size: ${theme.fonts.sm};
    line-height: 1.7;
    color: ${theme.colors.OxfordBlue};
    word-break: break-word;

    h1,
    h2 {
      font-size: 1.25em;
      font-weight: 600;
      margin: 20px 0 8px;
      color: ${theme.colors.ebony};

      &:first-child {
        margin-top: 0;
      }
    }

    h3,
    h4,
    h5,
    h6 {
      font-size: 1.1em;
      font-weight: 600;
      margin: 16px 0 6px;
      color: ${theme.colors.ebony};

      &:first-child {
        margin-top: 0;
      }
    }

    p {
      margin: 0 0 10px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    ul,
    ol {
      margin: 4px 0 10px;
      padding-left: 24px;
    }

    li {
      margin-bottom: 4px;
    }

    strong {
      font-weight: 600;
      color: ${theme.colors.ebony};
    }

    code {
      background: ${theme.colors.athensGray};
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.92em;
    }

    pre {
      background: ${theme.colors.mirage};
      color: ${theme.colors.athensGray3};
      padding: 14px 16px;
      border-radius: 10px;
      overflow-x: auto;
      margin: 10px 0;

      code {
        background: none;
        padding: 0;
        font-size: inherit;
      }
    }

    blockquote {
      margin: 8px 0;
      padding-left: 12px;
      border-left: 3px solid ${theme.colors.mischka};
      color: ${theme.colors.paleSky};
    }
  `}
`;

export const Cursor = styled.span`
  ${({ theme }) => css`
    display: inline-block;
    width: 2px;
    height: 1em;
    background: var(
      --web-control-styles-main_color,
      ${theme.colors.mediumPurple}
    );
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: ${cursorBlink} 1s step-end infinite;
  `}
`;

// ─── Tool Call Components ───────────────────────────────────────────────────────

export const ToolCallWrapper = styled.div<{ $error?: boolean }>`
  ${({ theme, $error }) => css`
    border: 1px solid ${theme.colors.athensGray4};
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 4px;

    ${
      $error &&
      css`
        border-color: color-mix(
          in srgb,
          ${theme.colors.flamingo} 30%,
          transparent
        );
      `
    }
  `}
`;

export const ToolCallHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    cursor: pointer;
    background: ${theme.colors.white};
    transition: background 0.15s;

    &:hover {
      background: ${theme.colors.athensGray3};
    }
  `}
`;

export const ToolCallName = styled.span`
  ${({ theme }) => css`
    font-size: 13px;
    font-weight: 500;
    color: ${theme.colors.OxfordBlue};
  `}
`;

export const ToolCallStatus = styled.span`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const ToolCallDuration = styled.span`
  ${({ theme }) => css`
    font-size: 12px;
    color: ${theme.colors.paleSky};
  `}
`;

export const ToolCallDetails = styled.div`
  ${({ theme }) => css`
    padding: 0 14px 12px;
    border-top: 1px solid ${theme.colors.athensGray4};
  `}
`;

export const ToolCallJson = styled.pre`
  ${({ theme }) => css`
    font-size: 12px;
    background: ${theme.colors.mirage};
    color: ${theme.colors.athensGray3};
    padding: 10px 12px;
    border-radius: 8px;
    overflow-x: auto;
    white-space: pre-wrap;
    max-height: 200px;
    overflow-y: auto;
    margin: 0;
  `}
`;

export const ToolCallsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
