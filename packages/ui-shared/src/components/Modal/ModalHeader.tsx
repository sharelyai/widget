import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { Close } from '../../icons';

interface ModalHeaderProps {
  title?: ReactNode;
  onClose?: () => void;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

const HeaderWrapper = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid ${theme.colors.mischka};
    margin-bottom: 16px;

    .modal-header-left, .modal-header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

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
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      padding: 0;

      & > svg {
        width: 24px;
        height: 24px;
        fill: ${theme.colors.ebony};
      }
    }
  `}
`;

export const ModalHeader = ({ title, onClose, leftContent, rightContent }: ModalHeaderProps) => (
  <HeaderWrapper>
    <div className="modal-header-left">
      {leftContent}
      {title && <span className="modal-header-title">{title}</span>}
    </div>
    <div className="modal-header-right">
      {rightContent}
      {onClose && (
        <button className="modal-header-close" onClick={onClose} aria-label="Close">
          <Close />
        </button>
      )}
    </div>
  </HeaderWrapper>
);
