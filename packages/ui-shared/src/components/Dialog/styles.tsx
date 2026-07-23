import styled, { css } from "styled-components";

export const Wrapper: any = styled.div`
  ${({ theme }) => css`
    .modal-overlay {
      backdrop-filter: blur(8px);
      background-color: ${theme.colors.white}99;
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      height: 100%;
      width: 100%;
      z-index: 1000;
    }

    .modal-content {
      background: ${theme.colors.white};
      box-shadow: ${theme.shadows.smallest};
      overflow: auto;
      position: relative;
      height: auto;
      border-radius: 20px;
      padding: 32px;
      width: 666px;
    }

    .modal-content-title {
      color: ${theme.colors.ebony};
      font-size: ${theme.fonts.xl};
      font-weight: 600;
      line-height: 24px;
      margin: 0;
      margin-bottom: 24px;
    }

    .modal-content-description {
      color: ${theme.colors.fiord};
      font-size: ${theme.fonts.base};
      font-weight: 400;
      line-height: 26px;
      margin: 0;
      padding-bottom: 24px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 14px;
    }

    .btn {
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: ${theme.fonts.sm};
      font-weight: 600;
      margin: 0;
      padding: 12px 16px;
    }

    .modal-action-button-cancel {
      background-color: ${theme.colors.white};
      border: 1px solid ${theme.colors.mischka};
      color: ${theme.colors.OxfordBlue};
    }

    .modal-action-button-confirm {
      background-color: ${theme.colors.thunderbird};
      border: none;
      color: ${theme.colors.white};
    }
  `}
`;
