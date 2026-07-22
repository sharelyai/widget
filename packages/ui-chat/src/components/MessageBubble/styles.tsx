import styled, { css } from 'styled-components';

type WrapperProps = {
  type?: string;
};

export const Wrapper: any = styled.div<WrapperProps>`
  ${({ theme, type }) => {
    const isAi = type === 'AI';
    return css`
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 0;

      .sharelyai-webcontroller-content-message-image-ai {
        width: 34px;
        height: 32px;
        align-self: flex-start;
        background-color: ${theme.colors.white};
        border-radius: 50%;
        border: 1px solid ${theme.colors.whiteLilac};
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        & > img {
          width: 100%;
          height: 100%;
          border-radius: 100%;
        }

        & > svg {
          width: 20px;
          height: 20px;
        }
      }

      .sharelyai-webcontroller-content-message-image-user {
        width: 34px;
        height: 32px;
        align-self: flex-start;
        background-color: ${theme.colors.white};
        border-radius: 50%;
        border: 1px solid ${theme.colors.whiteLilac};
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        & > svg {
          width: 20px;
          height: 20px;
          fill: ${theme.colors.paleSky};
        }
      }

      .sharelyai-webcontroller-content-message {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;

        .sharelyai-webcontroller-content-message-header {
          display: flex;
          align-items: center;
          gap: 8px;

          .sharelyai-webcontroller-content-message-name {
            color: ${theme.colors.ebony};
            font-size: ${theme.fonts.base};
            font-weight: 600;
            line-height: 24px;
            margin: 0;
          }

          .sharelyai-webcontroller-content-message-icon {
            display: flex;
            align-items: center;
            cursor: pointer;

            & > svg {
              width: 16px;
              height: 16px;
              fill: var(
                --web-control-styles-main_color,
                ${theme.colors.indigo}
              );
            }
          }

          .sharelyai-webcontroller-content-message-tooltip {
            color: ${theme.colors.paleSky};
            font-size: ${theme.fonts.xs};
            margin: 0;
          }
        }

        .sharelyai-webcontroller-content-message-text {
          color: ${theme.colors.fiord};
          font-size: ${theme.fonts.base};
          font-style: normal;
          font-weight: 400;
          line-height: 28px;
          word-break: break-word;

          h1, h2, h3, h4, h5, h6 {
            margin: 16px 0 8px 0;

            &:first-child {
              margin-top: 0;
            }
          }

          h1 { font-size: 1.5em; font-weight: 600; }
          h2 { font-size: 1.3em; font-weight: 600; }
          h3 { font-size: 1.15em; font-weight: 600; }
          h4, h5, h6 { font-size: 1em; font-weight: 600; }

          p {
            margin: 0 0 8px 0;

            &:last-child {
              margin-bottom: 0;
            }
          }

          ul, ol {
            margin: 8px 0;
            padding-left: 24px;
          }

          li {
            margin-bottom: 4px;
          }

          blockquote {
            margin: 8px 0;
            padding-left: 12px;
            border-left: 3px solid ${theme.colors.paleSky};
          }
        }

        .sharelyai-webcontroller-content-message-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 0;
        }

        .chat-content-conversation-text-save-message {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          background: var(
            --web-control-styles-main_card_background,
            ${theme.colors.whiteLilac2}
          );
          border-radius: 12px;
          margin-top: 8px;

          .left {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .title {
              color: ${theme.colors.ebony};
              font-size: ${theme.fonts.sm};
              font-weight: 600;
              margin: 0;
            }

            .description {
              color: ${theme.colors.paleSky};
              font-size: ${theme.fonts.xs};
              margin: 0;
            }
          }

          .right {
            button {
              background: var(
                --web-control-styles-main_color,
                ${theme.colors.indigo}
              );
              color: ${theme.colors.white};
              border: none;
              border-radius: 50px;
              padding: 8px 16px;
              font-size: ${theme.fonts.sm};
              font-weight: 600;
              cursor: pointer;
              white-space: nowrap;
            }
          }
        }

        .sharelyai-webcontroller-message-thread-button-action {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: ${theme.colors.paleSky};
          font-size: ${theme.fonts.xs};
          margin-top: 4px;

          &:empty {
            display: none;
          }

          .sharelyai-webcontroller-chat-content-conversation-picture-container {
            width: 20px;
            height: 20px;

            img,
            div {
              width: 20px;
              height: 20px;
              border-radius: 50%;
            }

            .sharelyai-webcontroller-chat-content-conversation-picture {
              display: flex;
              align-items: center;
              justify-content: center;
              background: ${theme.colors.whiteLilac};

              & > svg {
                width: 12px;
                height: 12px;
                fill: ${theme.colors.paleSky};
              }
            }
          }

          .sharelyai-webcontroller-chat-content-conversation-picture-rest-users {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${theme.colors.whiteLilac};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: ${theme.colors.paleSky};
          }
        }
      }

      /* User messages render as a right-aligned chat bubble (avatar + name
         hidden), so the conversation reads as user-right / AI-left instead of
         every message stacking on the same side. */
      ${!isAi &&
      css`
        justify-content: flex-end;

        .sharelyai-webcontroller-content-message-image-ai,
        .sharelyai-webcontroller-content-message-image-user {
          display: none;
        }

        .sharelyai-webcontroller-content-message {
          flex: 0 1 auto;
          max-width: 82%;
          align-items: flex-end;
          padding: 10px 14px;
          background: ${theme.colors.whiteLilac};
          border-radius: 16px 16px 4px 16px;
        }

        .sharelyai-webcontroller-content-message
          .sharelyai-webcontroller-content-message-header {
          display: none;
        }

        .sharelyai-webcontroller-content-message
          .sharelyai-webcontroller-content-message-text {
          text-align: left;
        }
      `}
    `;
  }}
`;
