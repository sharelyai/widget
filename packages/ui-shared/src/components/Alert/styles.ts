import styled, { css } from "styled-components";

export const AlertWrapper: any = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    min-width: 356px;
    height: auto;
    min-height: 40px;
    padding: 4px 8px 4px 16px;
    gap: 12px;
    display: flex;
    align-items: center;
    border-radius: 8px;
    font-weight: 600;
    line-height: 20px;
    background: ${theme.colors.white};
    box-shadow: ${theme.shadows.smallest};
    color: ${theme.colors.ebony};
    font-size: ${theme.fonts.sm};

    & > .sharelyai-webcontroller-icon-alert-body {
      width: 20px;
      height: 20px;
      border-radius: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${theme.colors.jade};
      fill: ${theme.colors.white};

      & > svg {
        width: 15px;
        height: 15px;
      }
    }
  `}
`;
