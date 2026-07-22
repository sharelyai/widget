import styled, { css } from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(16, 24, 40, 0.45);
  backdrop-filter: blur(2px);
`;

export const Container = styled.div`
  ${({ theme }) => css`
    position: relative;
    width: 100%;
    max-width: 420px;
    max-height: calc(100vh - 32px);
    overflow: auto;
    box-sizing: border-box;
    padding: 24px;
    background: ${theme.colors.white};
    border-radius: 20px;
    box-shadow: ${theme.shadows?.medium || "0 8px 32px rgba(0, 0, 0, 0.16)"};
  `}
`;

export const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    margin-bottom: 8px;
    border-bottom: 1px solid ${theme.colors.mischka};

    .about-title {
      color: ${theme.colors.ebony};
      font-size: ${theme.fonts.lg};
      font-weight: 600;
      line-height: 24px;
    }
  `}
`;

export const InfoList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const InfoRow = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid ${theme.colors.athensGray};

    &:last-child {
      border-bottom: none;
    }

    .about-label {
      color: ${theme.colors.gullGray};
      font-size: ${theme.fonts.base};
      white-space: nowrap;
    }

    .about-value {
      color: ${theme.colors.ebony};
      font-size: ${theme.fonts.base};
      font-weight: 600;
      text-align: right;
      word-break: break-word;
    }
  `}
`;
