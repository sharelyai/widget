import styled, { css } from "styled-components";

export const Wrapper: any = styled.div`
  ${({ theme }: { theme: any }) => css`
    .sharelyai-webcontroller-first-view {
      display: flex;
      flex-direction: column;
      gap: 24px;
      width: 100%;

      @media (min-width: ${theme.screens.lg}) {
        gap: 32px;
      }

      & > .sharelyai-webcontroller-input-section {
        width: 100%;
        align-self: center;

        @media (min-width: ${theme.screens.lg}) {
          width: 60%;
        }
      }

      & > .sharelyai-webcontroller-greeting {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;

        & > p {
          margin: 0;
          color: ${theme.colors.ebony};
          font-size: ${theme.fonts.xl};
          text-align: center;
          font-style: normal;
          font-weight: 600 !important;
          line-height: normal;
          align-self: stretch;
        }

        & > svg,
        & > img {
          width: 44px;
          height: 44px;
          border-radius: 100%;
          border: 1px solid ${theme.colors.whiteLilac};
        }
      }

      & > .sharelyai-webcontroller-subheader {
        width: 100%;
        color: var(
          --web-control-styles-main_color,
          ${theme.colors.ebony}
        );
        font-size: ${theme.fonts.lg};
        text-align: center;
        font-weight: 500;
        text-decoration: underline !important;
      }

      & > .sharelyai-webcontroller-body {
        width: 100%;
        overflow: hidden;

        @media (min-width: ${theme.screens.lg}) {
          height: 100%;
          max-height: 429px;
        }

        .sharelyai-webcontroller-note {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          & > span {
            font-size: ${theme.fonts.sm};
            text-align: center;
            width: 700px;
            text-align: left;
            font-style: italic;
            color: ${theme.colors.paleSky};
            font-weight: 500;
          }

          /* Looks like inline note text but is a real, focusable button so the
             host can wire it to an "About" modal via onVersionClick. */
          .sharelyai-webcontroller-note-version {
            font: inherit;
            color: inherit;
            background: none;
            border: none;
            padding: 0;
            margin: 0;
            cursor: pointer;
            white-space: nowrap;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }
  `}
`;
