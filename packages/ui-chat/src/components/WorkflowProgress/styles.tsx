import styled, { css } from 'styled-components';

export const Wrapper: any = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    width: 100%;

    & > .right {
      display: flex;
      justify-content: flex-end;
      padding: 0 24px;
    }

    & > .process-section {
      background: none;
      border: 1px solid ${theme.colors.athensGray2};
      border-radius: 6px;
      padding: 4px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: ${theme.colors.paleSky};
      font-size: ${theme.fonts.xs};
      font-weight: 600;
      transition: all 0.2s;

      &:hover {
        background: ${theme.colors.athensGray2};
        color: ${theme.colors.ebony};
      }

      &.open {
        background: ${theme.colors.whiteLilac};
        border-color: ${theme.colors.indigo};
        color: ${theme.colors.indigo};

        svg {
          transform: rotate(180deg);
          fill: ${theme.colors.indigo};
        }
      }

      svg {
        width: 14px;
        height: 14px;
        fill: ${theme.colors.paleSky};
        transition: transform 0.2s;
      }
    }

    & > .process-progress {
      padding: 16px 24px;
      background: ${theme.colors.athensGray2}40;
      border-top: 1px solid ${theme.colors.athensGray2};
      border-bottom: 1px solid ${theme.colors.athensGray2};

      & > .process-progress-body {
        display: flex;
        flex-direction: column;
        gap: 16px;

        & > .step {
          display: flex;
          gap: 12px;

          & > .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            color: ${theme.colors.indigo};

            svg {
              width: 16px;
              height: 16px;
            }
          }

          & > .content {
            display: flex;
            flex-direction: column;
            gap: 2px;

            & > .title {
              color: ${theme.colors.ebony};
              font-size: ${theme.fonts.sm};
              font-weight: 600;
            }

            & > .description {
              color: ${theme.colors.fiord};
              font-size: ${theme.fonts.xs};
            }
          }
        }
      }
    }
  `}
`;