import styled, { css } from "styled-components";

export const LoaderWrapper: any = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;

    .sharelyai-webcontroller-logo {
      width: 32px;
      height: 32px;

      & > img,
      & > svg {
        width: 32px;
        height: 32px;
        border: 1px solid ${theme.colors.whiteLilac};
        border-radius: 100%;
      }
    }

    .sharelyai-webcontroller-text {
      color: ${theme.colors.fiord};
      font-size: ${theme.fonts.sm};
      font-style: normal;
      font-weight: 400;
      line-height: 28px;
      margin: 0;
      margin-left: 12px;
    }

    .sharelyai-webcontroller-dot-flashing {
      position: relative;
      width: 8px;
      height: 8px;
      border-radius: 5px;
      background-color: ${theme.colors.mineShaft};
      color: ${theme.colors.mineShaft};
      animation: dot-flashing 1s infinite linear alternate;
      animation-delay: 0.5s;
      margin-left: 25px;
    }

    .sharelyai-webcontroller-dot-flashing::before,
    .sharelyai-webcontroller-dot-flashing::after {
      content: "";
      display: inline-block;
      position: absolute;
      top: 0;
    }

    .sharelyai-webcontroller-dot-flashing::before {
      left: -15px;
      width: 8px;
      height: 8px;
      border-radius: 5px;
      background-color: ${theme.colors.mineShaft};
      color: ${theme.colors.mineShaft};
      animation: dot-flashing 1s infinite alternate;
      animation-delay: 0s;
    }
    .sharelyai-webcontroller-dot-flashing::after {
      left: 15px;
      width: 8px;
      height: 8px;
      border-radius: 5px;
      background-color: ${theme.colors.mineShaft};
      color: ${theme.colors.mineShaft};
      animation: dot-flashing 1s infinite alternate;
      animation-delay: 1s;
    }

    @keyframes dot-flashing {
      0% {
        background-color: ${theme.colors.mineShaft};
      }

      50%,
      100% {
        background-color: ${theme.colors.alto};
      }
    }
  `}
`;

export const CardLoadingWrapper: any = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    z-index: 40;
    height: 100%;
    width: 100%;

    .sharelyai-webcontroller-loading-component {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 28px;

      & > .sharelyai-webcontroller-loading-icon {
        width: 52px;
        height: 52px;

        & > .sharelyai-webcontroller-circular-loader {
          width: 52px;
          height: 52px;
          border-radius: 100%;
          border: 4px solid
            var(--web-control-styles-main_color, ${theme.colors.amethyst});
          border-top-color: ${theme.colors.transparent};
          animation: spin 1s linear infinite;

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        }
      }

      & > .sharelyai-webcontroller-loading-text {
        color: ${theme.colors.ebony};
        font-size: ${theme.fonts.base};
        z-index: 50;
        font-style: normal;
        font-weight: 600;
        line-height: 32px;
      }
    }
  `}
`;

export const CircularLoader: any = styled.div`
  ${({ theme }) => css`
    width: 52px;
    height: 52px;
    border-radius: 100%;
    border: 2px solid
      var(--web-control-styles-main_color, ${theme.colors.amethyst});
    border-top-color: ${theme.colors.transparent};
    animation: spin 1s linear infinite;

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `}
`;
