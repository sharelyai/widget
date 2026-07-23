import { css, styled } from "styled-components";

interface IProps {
  $isOpen?: boolean;
  $bottom?: number;
  $left?: number;
}

export const BackgroundWrapper: any = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  z-index: 30;
`;

export const Wrapper: any = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith("$"),
})<IProps>`
  ${({ theme, $isOpen, $left = 0, $bottom = 70 }) => css`
    display: ${$isOpen ? "block" : "none"};
    width: 460px;
    position: absolute;
    bottom: ${$bottom}px;
    left: ${$left}px;
    z-index: 35;
    background-color: ${theme.colors.white};
    border-radius: 20px;
    box-shadow: ${theme.shadows.small};
    max-height: calc(100vh - 150px);
    overflow-y: hidden;

    @media (max-width: ${theme.screens["lg"]}) {
      position: absolute;
      bottom: 0;
      border-radius: 0;
      height: 70vh;
      max-height: 100%;
      width: 100%;
      left: 0;
      bottom: 0;
    }

    p {
      margin: 0;
      padding: 0;
    }

    & .drag-bar-container {
      padding-top: 16px;
      display: grid;
      grid-template-columns: 1fr;

      div {
        display: flex;
        justify-content: center;
        padding: 0 16px;

        svg {
          width: 24px;
          height: 24px;
          fill: ${theme.colors.paleSky};
        }

        &:last-of-type {
          justify-content: flex-end;
        }
      }
    }

    .user-menu-header {
      padding: 20px 16px;
      display: grid;
      align-items: center;
      grid-template-columns: 40px auto auto;
      border-bottom: 1px solid ${theme.colors.athensGray4};

      @media (max-width: ${theme.screens["lg"]}) {
        display: flex;
        flex-direction: column;
        align-items: baseline;
        gap: 16px;
        padding: 20px 24px;
      }

      @media (max-width: ${theme.screens["sm"]}) {
        padding: 20px 16px;
      }

      .user-menu-header-picture {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${theme.colors.indigo};
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          fill: ${theme.colors.white};
        }

        img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
      }

      .user-menu-header-texts {
        margin-left: 8px;
        margin-right: 20px;
        overflow: hidden;
        width: 100%;

        @media (max-width: ${theme.screens["lg"]}) {
          margin-left: 0;
        }

        .user-menu-header-title {
          color: ${theme.colors.ebony};
          font-size: ${theme.fonts.base};
          font-weight: 600;
          line-height: 20px;
        }

        .user-menu-header-description {
          color: ${theme.colors.fiord};
          font-size: ${theme.fonts.sm};
          line-height: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 90%;
        }
      }

      .button {
        .user-menu-header-button {
          border-radius: 8px;
          font-size: ${theme.fonts.sm};
          text-transform: initial;
          border: 1px solid ${theme.colors.mischka};
          color: ${theme.colors.OxfordBlue};
          font-weight: 600;
          width: 144px;
        }
      }
    }

    .user-menu-body {
      .option {
        display: flex;
        padding: 20px 16px;
        align-items: center;
        border-bottom: 1px solid ${theme.colors.mischkaLight};
        cursor: pointer;
        gap: 8px;

        @media (max-width: ${theme.screens["lg"]}) {
          padding: 20px 24px;
        }

        @media (max-width: ${theme.screens["sm"]}) {
          flex-wrap: wrap;
          gap: 16px;
          padding: 20px 16px;
        }

        & > .icon {
          width: 40px;
          height: 40px;
          fill: ${theme.colors.primary};
          border-radius: 20px;
          background: ${theme.colors.selago};
          display: flex;
          align-items: center;
          justify-content: center;

          &.indigo {
            fill: ${theme.colors.indigo};
            background: ${theme.colors.mischkaLight};
          }
        }

        & > .wrapper-text {
          & > .title {
            color: ${theme.colors.ebony};
            font-size: ${theme.fonts.sm};
            font-style: normal;
            font-weight: 600;
            line-height: 24px;
          }

          & > .sub-title {
            color: ${theme.colors.fiord};
            font-size: ${theme.fonts.sm};
            line-height: 20px;
          }

          @media (max-width: ${theme.screens["lg"]}) {
            flex-grow: 3;

            & > .icon {
              width: 40px;
              height: 40px;
              fill: ${theme.colors.primary};
              border-radius: 20px;
              background: ${theme.colors.selago};
              display: flex;
              align-items: center;
              justify-content: center;

              &.indigo {
                fill: ${theme.colors.indigo};
                background: ${theme.colors.mischkaLight};
              }
            }
          }
        }

        & > .arrow-icon {
          width: 20px;
          height: 20px;
          fill: ${theme.colors.fiord};

          @media (max-width: ${theme.screens["lg"]}) {
            color: ${theme.colors.indigo};
            display: flex;
            flex-grow: 2;
            justify-content: space-around;
          }

          @media (max-width: ${theme.screens["sm"]}) {
            justify-content: flex-start;
            width: 100%;
          }
        }
      }
    }

    .user-menu-log-out {
      display: grid;
      align-items: center;
      grid-template-columns: 20px 1fr;
      grid-gap: 8px;
      padding: 16px;
      cursor: pointer;

      @media (max-width: ${theme.screens["lg"]}) {
        position: fixed;
        bottom: 0;
        padding: 20px 24px;
        width: 100%;
      }

      @media (max-width: ${theme.screens["lg"]}) {
        padding: 20px 16px;
      }

      .user-menu-log-out-text {
        color: ${theme.colors.ebony};
        font-size: ${theme.fonts.sm};
        font-weight: 600;
        line-height: 24px;
      }

      & > svg {
        width: 20px;
        height: 20px;
        fill: ${theme.colors.fiord};
      }
    }
  `}
`;
