import { css, styled } from "styled-components";
import { Theme } from "../../theme";

export interface IWrapperProps {
  customHeight?: string;
  customWidth?: string;
  customMaxWidth?: string;
  customMaxHeight?: string;
  modalContainerProps?: {
    padding?: string;
  };
  isFullScreen?: boolean;
  modalBackgroundColor?: keyof Theme["colors"];
  position?: string;
}

export const Wrapper: any = styled.div<IWrapperProps>`
  ${({
    theme,
    customHeight,
    customWidth,
    modalContainerProps,
    customMaxHeight,
    customMaxWidth,
    isFullScreen,
    modalBackgroundColor,
    position = "fixed",
  }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: ${position};
    height: 100%;
    width: 100%;
    z-index: 99999;

    ${
      isFullScreen &&
      css`
        width: 100%;
        height: 100%;
        border-radius: 0;
        top: 0;
        left: 0;
      `
    }

    .modal-background {
      background-color: ${theme.colors[modalBackgroundColor ?? "white"]}60;
      backdrop-filter: blur(2px);
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
    }

    .modal-container {
      position: relative;
      margin: 0 auto;
      overflow: auto;
      width: ${customWidth || "663px"};
      height: ${customHeight || "max-content"};
      border-radius: 8px;
      background-color: ${theme.colors.white};
      box-shadow: ${theme.shadows.smallest};
      padding: ${modalContainerProps?.padding ?? "32px"};
      max-width: ${customMaxWidth};
      max-height: ${customMaxHeight};

      @media (max-width: ${theme.screens.sm}) {
        height: 100%;
        border-radius: 0;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .modal-header-title {
          color: ${theme.colors.ebony};
          font-size: ${theme.fonts.xl};
          font-weight: 600;
          line-height: 24px;
        }

        .modal-header-close {
          width: 24px;
          height: 24px;
          cursor: pointer;

          & > svg {
            width: 24px;
            height: 24px;
            fill: ${theme.colors.ebony};
          }
        }
      }
    }
  `}
`;
