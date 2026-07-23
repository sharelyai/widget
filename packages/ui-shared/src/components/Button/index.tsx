import React, { ButtonHTMLAttributes } from "react";
import styled, { css } from "styled-components";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const StyledButton = styled.button<ButtonProps>`
  ${({ theme, variant = "primary", size = "md" }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    gap: 8px;

    ${
      size === "sm" &&
      css`
        padding: 8px 12px;
        font-size: ${theme.fonts.xs};
      `
    }
    ${
      size === "md" &&
      css`
        padding: 12px 16px;
        font-size: ${theme.fonts.sm};
      `
    }
    ${
      size === "lg" &&
      css`
        padding: 16px 24px;
        font-size: ${theme.fonts.base};
      `
    }

    ${
      variant === "primary" &&
      css`
        background-color: ${theme.colors.primary};
        color: ${theme.colors.white};
        &:hover {
          opacity: 0.9;
        }
      `
    }
    
    ${
      variant === "outline" &&
      css`
        background-color: transparent;
        border: 1px solid ${theme.colors.mischka};
        color: ${theme.colors.OxfordBlue};
        &:hover {
          background-color: ${theme.colors.athensGray4};
        }
      `
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `}
`;

export const Button = (props: ButtonProps) => <StyledButton {...props} />;
