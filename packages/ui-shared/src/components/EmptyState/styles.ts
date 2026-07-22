import styled, { css } from "styled-components";

export interface IWrapperProps {
  color?: "primary" | "indigo";
  customWidth?: string;
}

export const Wrapper: any = styled.div<IWrapperProps>`
  ${({ theme, color, customWidth }) => css`
    --container-empty-chat-width: 615px;
    --container-empty-chat-margin-top: 128px;

    height: 100%;

    .space-container-empty-chat {
      display: flex;
      justify-content: center;
      height: 100%;

      .space-container-empty-chat-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: ${customWidth || "var(--container-empty-chat-width, 615px)"};

        @media (max-width: ${theme.screens["md"]}) {
          padding: 16px;
          justify-content: center;
          margin-top: 0;
          width: 100%;
        }

        .space-container-empty-chat-empty-picture {
          width: auto;
          height: auto;
          max-height: 196px;
        }

        .space-container-empty-chat-empty-text {
          color: ${theme.colors.ebony};
          font-size: ${theme.fonts["xl"]};
          font-weight: 600;
          line-height: 34px;

          @media (max-width: ${theme.screens["xl"]}) {
            font-size: ${theme.fonts["base"]};
            margin-top: 0;
          }
        }

        .space-container-empty-chat-subtext {
          color: ${theme.colors.fiord};
          text-align: center;
          font-size: ${theme.fonts.base};
          line-height: 24px;

          @media (max-width: ${theme.screens["xl"]}) {
            font-size: ${theme.fonts["sm"]};
            margin-top: 0;
          }
        }

        .buttons-container {
          display: flex;
          flex-direction: row;
          gap: 24px;
          margin-top: 24px;

          .optional-button-action {
            & button {
              background-color: ${theme.colors.white};
              border: 1px solid ${theme.colors.mischka};
              border-radius: 8px;
              color: ${theme.colors.ebony};
            }
          }
        }

        .buttons-starting {
          gap: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;

          button {
            text-transform: initial;
            background-color: ${theme.colors[color || "primary"]};
            color: ${theme.colors.white};
            border-radius: 8px;
            padding: 8px 14px;
            font-size: ${theme.fonts.sm};
            font-weight: 600;
            line-height: 20px;

            &:disabled {
              background-color: ${theme.colors.athensGray6};
              border: none;
            }
          }

          a {
            color: ${theme.colors[color || "primary"]};
            font-size: ${theme.fonts.sm};
            font-weight: 600;
            line-height: 20px;
            max-width: max-content;
          }
        }
      }
    }
  `}
`;