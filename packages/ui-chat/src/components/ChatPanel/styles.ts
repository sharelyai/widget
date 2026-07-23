import styled, { css } from "styled-components";

export const Wrapper: any = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
    height: 100%;
    background: ${theme.colors.white};

    & > .scrollbar-container {
      flex-grow: 1;
      height: 100%;
    }

    .sharelyai-webcontroller-content-chat {
      display: flex;
      flex-direction: column-reverse;
      grid-gap: 12px;
      padding: 20px;
    }

    .sharelyai-webcontroller-container-input {
      width: 100%;
      padding: 12px 20px;

      .sharelyai-webcontroller-content-message-questions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;

        .sharelyai-webcontroller-content-message-question {
          background: var(
            --web-control-styles-main_card_background,
            ${theme.colors.whiteLilac2}
          );
          color: ${theme.colors.fiord};
          border: 1px solid ${theme.colors.athensGray2};
          border-radius: 50px;
          padding: 8px 16px;
          font-size: ${theme.fonts.sm};
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;

          &:hover {
            border-color: var(
              --web-control-styles-main_color,
              ${theme.colors.indigo}
            );
            color: var(--web-control-styles-main_color, ${theme.colors.indigo});
          }
        }
      }
    }
  `}
`;
