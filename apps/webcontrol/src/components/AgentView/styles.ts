import styled, { css, keyframes } from "styled-components";
import { constants } from "@sharelyai/widget-services";

interface IWrapperProps {
  mode?: string;
  hasMessages?: boolean;
}

const blink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
`;

export const Wrapper = styled.div<IWrapperProps>`
  ${({ theme, mode, hasMessages }) => css`
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
    padding: 20px;

    ${
      mode === constants.POSITION_PLACED_INLINE &&
      hasMessages &&
      css`
        padding-bottom: 0;
        position: relative;
        overflow: visible !important;

        .sharelyai-webcontroller-container-input {
          position: -webkit-sticky;
          position: sticky;
          bottom: 0;
          left: 0;
          right: 0;
          background: ${theme.colors.white};
          padding: 20px;
          padding-top: 40px;
          z-index: 20;
        }

        & .scrollbar-container {
          padding-bottom: 120px;
          overflow: visible !important;
        }
      `
    }

    & .scrollbar-container {
      flex-grow: 1;
      height: 100%;
    }

    .sharelyai-webcontroller-content-chat {
      display: flex;
      flex-direction: column-reverse;
      grid-gap: 12px;
    }

    .sharelyai-webcontroller-agent-error {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: ${theme.colors.provincialPink || "#fef2f2"};
      border: 1px solid ${theme.colors.cinderella || "#fecaca"};
      border-radius: 8px;
      color: ${theme.colors.thunderbird || "#dc2626"};
      font-size: ${theme.fonts.sm};

      button {
        background: none;
        border: none;
        color: ${theme.colors.thunderbird || "#dc2626"};
        cursor: pointer;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 4px;

        &:hover {
          background: ${theme.colors.cinderella || "#fecaca"};
        }
      }
    }

    .sharelyai-webcontroller-container-input {
      width: 100%;

      .sharelyai-webcontroller-content-input-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        margin-top: 12px;
      }

      .sharelyai-webcontroller-content-input {
        border-radius: 50px;
        border: 1px solid ${theme.colors.athensGray2};
        background-color: ${theme.colors.white};
        display: grid;
        align-items: center;
        grid-template-columns: auto 1fr auto;
        grid-gap: 16px;
        padding: 12px;
        width: 100%;

        &:focus-within {
          border: 1px solid
            var(--web-control-styles-main_color, ${theme.colors.indigo});
        }

        .sharelyai-webcontroller-image-user {
          background-color: ${theme.colors.white};
          border: 1px solid ${theme.colors.whiteLilac};
          border-radius: 50%;
          display: flex;
          align-items: center;
          align-self: center;
          justify-content: center;
          width: 40px;
          height: 40px;

          & > svg {
            fill: ${theme.colors.paleSky};
          }
        }

        & > input {
          height: 100%;
          width: 100%;
          padding-right: 0;
          border-radius: 50px;
          border: none;
          outline: none;
          color: ${theme.colors.ebony};
          font-size: ${theme.fonts.base};
          font-style: normal;
          font-weight: 500;
          line-height: 20px;

          &::placeholder {
            color: ${theme.colors.gullGray};
          }

          &:disabled {
            background-color: ${theme.colors.white};
            color: ${theme.colors.paleSky};
          }
        }

        & > .sharelyai-webcontroller-content-input-icon {
          background-color: var(
            --web-control-styles-main_color,
            ${theme.colors.indigo}
          );
          width: 40px;
          height: 40px;
          cursor: pointer;
          padding: 8px;
          border-radius: 50px;

          &.disabled {
            background-color: ${theme.colors.athensGray3};

            & > svg {
              fill: ${theme.colors.gullGray};
            }
          }

          & > svg {
            fill: ${theme.colors.white};
          }
        }
      }

      .sharelyai-webcontroller-content-input.sharelyai-webcontroller-disabled {
        border: 1px solid ${theme.colors.athensGray2};
        cursor: not-allowed;

        & > .sharelyai-webcontroller-content-input-icon {
          & > svg > g > path {
            fill: ${theme.colors.athensGray2};
            cursor: not-allowed;
          }
        }
      }

      .sharelyai-webcontroller-content-input.sharelyai-webcontroller-icon-disabled {
        & > .sharelyai-webcontroller-content-input-icon {
          & > svg > g > path {
            fill: ${theme.colors.mischka};
          }
        }
      }
    }
  `}
`;

export const StreamingMessageWrapper = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 0px;
    border-radius: 20px;

    .sharelyai-webcontroller-content-message-image-ai {
      width: 34px;
      height: 32px;
      align-self: flex-start;
      background-color: ${theme.colors.white};
      border-radius: 50%;
      border: 1px solid ${theme.colors.whiteLilac};
      flex-shrink: 0;

      & > img {
        width: 100%;
        height: 100%;
        border-radius: 100%;
      }
    }

    .sharelyai-webcontroller-streaming-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .sharelyai-webcontroller-content-message-name {
        color: ${theme.colors.ebony};
        font-size: ${theme.fonts.base};
        font-weight: 600;
        line-height: 24px;
        margin: 0;
      }

      .sharelyai-webcontroller-streaming-pending {
        display: flex;
        gap: 4px;
        padding: 8px 0;

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(
            --web-control-styles-main_color,
            ${theme.colors.indigo}
          );
          animation: ${bounce} 1.4s infinite ease-in-out both;

          &:nth-child(1) {
            animation-delay: -0.32s;
          }
          &:nth-child(2) {
            animation-delay: -0.16s;
          }
          &:nth-child(3) {
            animation-delay: 0s;
          }
        }
      }

      .sharelyai-webcontroller-streaming-thinking,
      .sharelyai-webcontroller-streaming-tools,
      .sharelyai-webcontroller-streaming-sources {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .sharelyai-webcontroller-streaming-text {
        color: ${theme.colors.fiord};
        font-size: ${theme.fonts.base};
        font-style: normal;
        font-weight: 400;
        line-height: 28px;

        .sharelyai-webcontroller-streaming-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: var(
            --web-control-styles-main_color,
            ${theme.colors.indigo}
          );
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: ${blink} 1s step-end infinite;
        }
      }
    }
  `}
`;

export const GreetingWrapper = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 24px;
    padding: 44px 24px 24px;
    flex: 1;

    .sharelyai-webcontroller-greeting-heading {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .sharelyai-webcontroller-greeting-text {
      margin: 0px;
      font-size: ${theme.fonts.xl};
      font-weight: 600;
      color: ${theme.colors.shark};
      text-align: left;
    }

    .sharelyai-webcontroller-greeting-description {
      margin: 0px;
      font-size: ${theme.fonts.base};
      color: ${theme.colors.gullGray};
      text-align: left;
    }

    .sharelyai-webcontroller-greeting-note {
      font-size: ${theme.fonts.sm};
      font-style: italic;
      color: ${theme.colors.gullGray};
      text-align: center;

      button {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        color: inherit;
        cursor: pointer;
      }
    }
  `}
`;
