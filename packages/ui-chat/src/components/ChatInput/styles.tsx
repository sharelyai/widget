import styled, { css } from "styled-components";

export const Wrapper: any = styled.div`
  ${({ theme }: { theme: any }) => css`
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
        border: 1px solid var(--web-control-styles-main_color, ${theme.colors.indigo});
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

  `}
`;
