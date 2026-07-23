import styled, { css } from "styled-components";

export const Wrapper: any = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: 8px;

    .thumb-container {
      display: flex;
      align-items: center;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;

      &.hover {
        opacity: 1;
      }

      .icon-button {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background 0.2s;

        &:hover {
          background: ${theme.colors.athensGray2};
        }

        svg {
          width: 16px;
          height: 16px;
          fill: ${theme.colors.paleSky};
        }

        &.like svg,
        &.unlike svg {
          fill: var(--web-control-styles-main_color, ${theme.colors.indigo});
        }
      }
    }

    .feedback {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border: 1px solid ${theme.colors.athensGray2};
      border-radius: 8px;
      background: ${theme.colors.white};

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .title {
          color: ${theme.colors.ebony};
          font-size: ${theme.fonts.sm};
          font-weight: 600;
          margin: 0;
        }

        .icon-button {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s;

          &:hover {
            background: ${theme.colors.athensGray2};
          }

          svg {
            width: 16px;
            height: 16px;
            fill: ${theme.colors.paleSky};
          }
        }
      }

      .body {
        textarea {
          width: 100%;
          border: 1px solid ${theme.colors.athensGray2};
          border-radius: 8px;
          padding: 8px 12px;
          font-size: ${theme.fonts.sm};
          font-family: inherit;
          color: ${theme.colors.ebony};
          resize: none;
          outline: none;
          background: ${theme.colors.white};

          &::placeholder {
            color: ${theme.colors.gullGray};
          }

          &:focus {
            border-color: var(
              --web-control-styles-main_color,
              ${theme.colors.indigo}
            );
          }
        }
      }

      .footer {
        display: flex;
        justify-content: flex-end;

        .submit {
          background: var(
            --web-control-styles-main_color,
            ${theme.colors.indigo}
          );
          color: ${theme.colors.white};
          border: none;
          border-radius: 50px;
          padding: 6px 16px;
          font-size: ${theme.fonts.sm};
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;

          &:hover {
            opacity: 0.9;
          }
        }
      }
    }
  `}
`;
