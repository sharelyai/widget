import styled, { css, DefaultTheme } from "styled-components";

// ---------- Position mode helpers ----------

const positionTopCenterFloating = (theme: DefaultTheme) => css`
  position: fixed;
  top: 20px;
  left: 0;
  right: 0;
  margin: 0 auto;
  z-index: 9999;

  &.is-open {
    top: 0;
    @media (max-width: ${theme.screens.lg}) {
      bottom: 0;
      left: 0;
    }
    @media (min-width: ${theme.screens.lg}) {
      margin-top: 20px;
    }
  }
`;

const positionBottomCenterFloating = (theme: DefaultTheme) => css`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;

  &.is-open {
    @media (max-width: ${theme.screens.lg}) {
      bottom: 0;
      right: 0;
    }
    @media (min-width: ${theme.screens.lg}) {
      margin: 0;
      margin-bottom: 20px;
    }
  }
`;

const positionBottomRightFloating = (theme: DefaultTheme) => css`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;

  &.is-open {
    @media (max-width: ${theme.screens.lg}) {
      bottom: 0;
      right: 0;
    }
    @media (min-width: ${theme.screens.lg}) {
      margin: 0;
      margin-bottom: 20px;
    }
  }
`;

const positionPlacedFloating = (theme: DefaultTheme) => css`
  @media (min-width: ${theme.screens.lg}) {
    transition: initial !important;
  }

  &.is-open {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;

    @media (max-width: ${theme.screens.lg}) {
      top: 0;
      left: 0;
      transform: none;
    }
  }
`;

const positionPlacedInline = (theme: DefaultTheme, width?: string) => css`
  &.is-open {
    position: relative;
    width: 100% !important;
    height: 100% !important;

    @media (min-width: ${theme.screens.md}) {
      width: ${width || "832px"} !important;
      min-height: 548px !important;
      height: 100% !important;
      margin: 0;
    }
  }
`;

// ---------- Wrapper ----------

type WrapperProps = {
  $mode?: string;
  $avatarCompact?: boolean;
  $displayWidth?: string;
  $displayHeight?: string;
};

export const Wrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith("$"),
})<WrapperProps>`
  ${({ theme, $mode, $avatarCompact, $displayWidth, $displayHeight }) => css`
    /* Base / launcher state */
    min-height: 44px;
    min-width: 300px;
    width: fit-content;
    border-radius: 50px;
    box-shadow: ${theme.shadows.smallest};
    padding: 8px;
    background-color: ${theme.colors.white};

    @media (min-width: ${theme.screens.lg}) {
      transition: all 0.3s ease-in-out;
    }

    /* ---- Position modes ---- */
    ${$mode === "top-center-floating" && positionTopCenterFloating(theme)}
    ${$mode === "bottom-center-floating" && positionBottomCenterFloating(theme)}
    ${$mode === "bottom-right-floating" && positionBottomRightFloating(theme)}
    ${$mode === "placed-floating" && positionPlacedFloating(theme)}
    ${$mode === "placed-inline" && positionPlacedInline(theme, $displayWidth)}

    /* If no mode or unrecognised, default to top-center-floating */
    ${!$mode && positionTopCenterFloating(theme)}

    /* ---- displayMode WIDTH / HEIGHT overrides ---- */
    ${
      $displayWidth &&
      css`
        &.is-open {
          width: ${$displayWidth} !important;
        }
      `
    }
    ${
      $displayHeight &&
      css`
        &.is-open {
          @media (min-width: ${theme.screens.lg}) {
            height: ${$displayHeight} !important;
          }
        }
      `
    }

    /* ---- Avatar compact mode (circle) ---- */
    ${
      $avatarCompact &&
      css`
        border-radius: 100%;
        min-width: 56px;
        min-height: 56px;
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease-in-out;

        .sharely-launcher {
          min-width: unset;
          .launcher-logo {
            border: 1px solid ${theme.colors.athensGray2};
            border-radius: 100%;
          }
          .launcher-text,
          .launcher-arrow {
            display: none;
          }
        }
      `
    }

    /* ---- Private display mode ---- */
    &.display-private {
      box-shadow: none;
    }

    /* ---- Launcher (closed-state pill) ---- */
    .sharely-launcher {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      min-width: 300px;

      .launcher-logo {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;

        img,
        svg {
          width: 40px;
          height: 40px;
          border: 1px solid ${theme.colors.whiteLilac};
          border-radius: 100%;
        }
      }

      .launcher-text {
        margin: 0;
        color: ${theme.colors.paleSky};
        font-size: ${theme.fonts.sm};
        font-weight: 500;
        line-height: 20px;

        @media (min-width: ${theme.screens.lg}) {
          font-size: ${theme.fonts.base};
        }
      }
    }

    /* ---- Open state ---- */
    &.is-open {
      padding: 0;
      width: 100%;
      height: 100vh;
      min-height: 400px;
      border-radius: 20px;
      touch-action: ${$mode === "placed-inline" ? "auto" : "none"};
      -ms-touch-action: ${$mode === "placed-inline" ? "auto" : "none"};

      /* Mobile: full screen */
      @media (max-width: ${theme.screens.lg}) {
        border-radius: 0;
      }

      /* Desktop: fixed panel size */
      @media (min-width: ${theme.screens.lg}) {
        width: 1008px;
        height: 619px;
        border-radius: 20px;
        touch-action: initial;
        -ms-touch-action: initial;
      }

      /* Hide launcher when open */
      .sharely-launcher {
        display: none;
      }
    }

    /* ---- Inline open overrides ---- */
    &.is-inline.is-open {
      border-radius: 0;
      box-shadow: none;

      .sharely-launcher {
        display: none;
      }
    }

    /* ---- Container (open panel content) ---- */
    .web-control-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      min-height: inherit;

      ${
        $mode === "placed-inline" &&
        css`
          overflow: visible;
        `
      }

      .web-control-header {
        padding: 16px 20px;
        box-sizing: border-box;

        .web-control-header-grid {
          width: 100%;
          align-items: center;
          height: 76px;
          gap: 14px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          overflow: hidden;

          & > :nth-child(2) {
            display: flex;
            justify-content: center;
          }

          & > :nth-child(3) {
            display: flex;
            justify-content: flex-end;
          }

          @media (max-width: ${theme.screens.lg}) {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            height: auto;
            gap: 8px;

            .header-left {
              grid-column: 1;
              grid-row: 1;
              overflow: hidden;
            }

            .header-center {
              grid-column: 1 / -1;
              grid-row: 2;
              justify-content: center;
              display: flex;
              overflow: hidden;
            }

            .header-right {
              grid-column: 2;
              grid-row: 1;
              justify-content: flex-end;
              display: flex;
            }
          }

          .header-left {
            display: flex;
            align-items: center;
            gap: 14px;
            min-width: 0;

            .header-logo-info {
              display: flex;
              gap: 8px;
              align-items: center;
              min-width: 0;

              .header-logo {
                flex-shrink: 0;
                width: 40px;
                height: 40px;

                & > svg,
                & > img {
                  width: 40px;
                  height: 40px;
                  border: 1px solid ${theme.colors.whiteLilac};
                  border-radius: 100%;
                }

                @media (min-width: ${theme.screens.lg}) {
                  width: 38px;
                  height: 38px;

                  & > svg,
                  & > img {
                    width: 38px;
                    height: 38px;
                  }
                }
              }

              .header-title {
                color: ${theme.colors.ebony};
                font-size: ${theme.fonts.lg};
                font-style: normal;
                font-weight: 600;
                line-height: 28px;
                white-space: nowrap;
                text-overflow: ellipsis;
                max-width: 200px;
                overflow: hidden;

                @media (max-width: ${theme.screens.lg}) {
                  max-width: 120px;
                }
              }
            }

            .header-threads-btn {
              cursor: pointer;
              flex-shrink: 0;
              fill: ${theme.colors.paleSky};
              background: none;
              border: none;
              padding: 0;
              display: flex;
              align-items: center;

              svg {
                fill: ${theme.colors.paleSky};
              }
            }
          }

          .header-right {
            display: flex;
            align-items: center;
            flex-shrink: 0;

            @media (min-width: ${theme.screens.lg}) {
              gap: 16px;
              flex-direction: row;
            }

            .header-action-btn {
              background: none;
              border: none;
              outline: none;
              display: flex;
              align-items: center;
              cursor: pointer;
              flex-shrink: 0;
              padding: 4px;

              svg {
                width: 24px;
                height: 24px;
                fill: ${theme.colors.paleSky};
              }

              &:hover svg {
                fill: ${theme.colors.fiord};
              }
            }
          }
        }
      }

      .web-control-content {
        flex: 1;
        display: flex;
        overflow: hidden;
      }
    }

    /* Portal mount point for modals, dialogs, tooltips, etc. */
    #modal {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 100;

      & > * {
        pointer-events: auto;
      }
    }
  `}
`;
