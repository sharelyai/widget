import React, { InputHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const StyledInput = styled.input<InputProps>`
  ${({ theme }) => css`
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid ${theme.colors.mischka};
    background-color: ${theme.colors.white};
    font-size: ${theme.fonts.sm};
    color: ${theme.colors.ebony};
    outline: none;
    
    &:focus {
      border-color: ${theme.colors.primary};
    }
    
    &::placeholder {
      color: ${theme.colors.gullGray};
    }

    &:disabled {
      background-color: ${theme.colors.athensGray};
      cursor: not-allowed;
    }
  `}
`;

export const Input = (props: InputProps) => <StyledInput {...props} />;
