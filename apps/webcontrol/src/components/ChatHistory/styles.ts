import styled, { css } from "styled-components";

interface Props {
  version?: string;
}

export const Wrapper = styled.div<Props>`
  ${({ theme, ...props }) => css`
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    overflow: hidden;

    .chat-history-background {
      background-color: ${theme.colors.white}99;
      backdrop-filter: blur(8px);
      border-radius: 20px;
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      z-index: 20;

      ${
        props.version === "v2" &&
        css`
          background-color: ${theme.colors.OxfordBlue}99;
        `
      }

      @media (max-width: ${theme.screens.sm}) {
        ${
          props.version === "v2" &&
          css`
            border-radius: 0px;
          `
        }
      }
    }

    .chat-history {
      display: flex;
      flex-direction: column;
      background: ${theme.colors.white};
      border-radius: 0px;
      box-shadow: ${theme.shadows.lowDepthShadow};
      height: 100%;
      overflow: hidden;
      position: absolute;
      bottom: 0;
      left: 0;
      top: 0;
      transition: width 0.3s ease;
      width: 0;
      z-index: 20;

      &.expanded {
        width: 370px;

        @media (min-width: ${theme.screens.md}) {
          border-radius: 20px 0 0 20px;

          ${
            props.version === "v2" &&
            css`
              width: 706px;
              height: 498px;
              box-shadow: ${theme.shadows.lowDepthShadow};
              border-radius: 20px;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            `
          }
        }
      }

      .loading-component {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
      }

      .chat-history-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;

        .chat-history-header-title {
          color: ${theme.colors.ebony};
          font-size: ${theme.fonts.sm};
          font-weight: 600;
          line-height: 20px;
        }

        .chat-history-header-close {
          cursor: pointer;
          width: 24px;
          height: 24px;

          fill: ${theme.colors.paleSky};
        }
      }

      .chat-history-menu-button {
        background-color: ${theme.colors.white};
        border: none;
        color: ${theme.colors.indigo};
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: ${theme.fonts.sm};
        font-weight: 600;
        line-height: 20px;
        outline: none;
        padding: 14px 20px;
        width: 100%;

        &:disabled {
          background-color: ${theme.colors.white};
          color: ${theme.colors.paleSky};
          cursor: default;

          &:hover {
            background-color: transparent;
          }
        }

        & > svg {
          width: 24px;
          height: 24px;
          fill: ${theme.colors.indigo};

          &:disabled {
            fill: ${theme.colors.paleSky};
          }
        }

        &:hover {
          background-color: ${theme.colors.whiteLilac};
        }
      }

      .button {
        button {
          border-radius: 0;
          justify-content: flex-start;
          padding: 12px 20px;
        }
      }

      .chat-history-body {
        position: relative;
        height: 100%;
        max-height: calc(100% - var(--buttons-height));
        flex: 1;
        overflow: hidden;

        .chat-history-body-container-period {
          display: flex;
          flex-direction: column;

          .chat-history-period-title {
            color: ${theme.colors.ebony};
            font-size: ${theme.fonts.xs};
            font-weight: 600;
            line-height: 20px;
            padding: 14px 20px;
          }

          .chat-history-period-history {
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            padding: 14px 20px;

            &:hover {
              background-color: ${theme.colors.whiteLilac};
            }

            &.selected-chat-preview {
              background-color: ${theme.colors.whiteLilac};

              .chat-history-chat-name-title {
                color: ${theme.colors.indigo};
                font-weight: 600;
              }
            }

            .chat-history-edit-chat-name,
            .chat-history-chat-name {
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
            }

            .chat-history-chat-name {
              & > .chat-history-actions {
                visibility: hidden;

                @media (max-width: ${theme.screens.sm}) {
                  visibility: visible;
                }
              }

              &:hover {
                & > .chat-history-actions {
                  visibility: visible;
                }
              }

              & > .chat-history-chat-name-title {
                color: ${theme.colors.fiord};
                flex: 1;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
            }

            .chat-history-edit-chat-name {
              gap: 8px;

              input {
                background-color: transparent;
                border: none;
                font-size: ${theme.fonts.base};
                width: 100%;
              }

              .chat-history-edit-chat-actions {
                display: flex;
                align-items: center;
                gap: 16px;
              }

              & > svg {
                cursor: pointer;
              }
            }

            .chat-history-actions {
              display: flex;
              align-items: center;
              gap: 12px;

              .chat-history-actions-menu {
                cursor: pointer;
                position: relative;
              }

              .chat-history-actions-options {
                background-color: ${theme.colors.white};
                border-color: ${theme.colors.mercury};
                box-shadow: ${theme.shadows.smallest};
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                padding: 8px 0;
                position: absolute;
                top: 100%;
                right: 0;
                z-index: 10;

                .chat-history-actions-option {
                  border: none;
                  background-color: transparent;
                  cursor: pointer;
                  padding: 8px 16px;
                  font-size: ${theme.fonts.sm};

                  &:hover {
                    background-color: ${theme.colors.pearl};
                    color: ${theme.colors.electricViolet};
                    font-weight: 600;
                  }
                }
              }

              & > div {
                width: max-content;
              }

              & > svg {
                fill: ${theme.colors.shuttleGray};
              }
            }
          }
        }
      }

      .chat-history-footer {
        display: flex;
        width: 367px;
        padding: 24px 20px;
        border-radius: 20px 20px 0px 0px;
        align-items: center;
        justify-content: center;

        ${
          props.version === "v2" &&
          css`
            width: 100%;
          `
        }

        & > .public-space {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;

          p {
            margin: 0;
            color: ${theme.colors.ebony};
            text-align: right;
            font-size: ${theme.fonts.sm};
            font-weight: 600;
          }

          button {
            padding: 0;
            border: none;
            background-color: transparent;
            cursor: pointer;
            color: ${theme.colors.indigo};
            font-size: ${theme.fonts.sm};
            font-weight: 600;
          }

          span {
            font-size: ${theme.fonts.sm};
            color: ${theme.colors.ebony};
          }

          & > .buttons {
            display: flex;
            gap: 12px;
          }
        }

        & > .private-space {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          cursor: pointer;

          & > .user-info {
            display: flex;
            align-items: center;
            gap: 8px;

            & > .photo {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background-color: ${theme.colors.indigo};

              & > img {
                border-radius: 50%;
                width: 32px;
                height: 32px;
              }

              & > svg {
                fill: ${theme.colors.white};
                width: 24px;
                height: 24px;
              }
            }

            & > span {
              margin: 0;
              color: ${theme.colors.ebony};
              font-size: ${theme.fonts.sm};
              font-style: normal;
              font-weight: 600;
              line-height: 20px;
            }
          }

          & > .icon {
            cursor: pointer;
            width: 24px;
            height: 24px;

            &.open {
              & > svg {
                transform: rotate(180deg);
              }
            }

            & > svg {
              width: 20px;
              height: 20px;
              fill: ${theme.colors.paleSky};
              transition: all 0.3s ease;
              rotate: 90deg;
            }
          }
        }
      }
    }
  `}
`;
