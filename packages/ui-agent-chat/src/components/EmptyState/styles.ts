import styled, { css } from "styled-components";

export const EmptyStateWrapper = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
    flex: 1;
    justify-content: center;

    @media (min-width: ${theme.screens.lg}) {
      gap: 20px;
    }
  `}
`;

export const EmptyStateGreeting = styled.div`
  ${({ theme }) => css`
    display: flex;
    width: 100%;
    padding: 44px 120px 24px 120px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;

    @media (max-width: ${theme.screens.md}) {
      padding: 40px 40px 12px 40px;
    }

    @media (max-width: ${theme.screens.sm}) {
      padding: 40px 20px 12px 20px;
    }
  `}
`;

export const EmptyStateTitle = styled.span`
  ${({ theme }) => css`
    color: ${theme.colors.ebony};
    text-align: left;
    font-size: ${theme.fonts.xl};
    font-weight: 600;
    line-height: normal;
  `}
`;

export const EmptyStateDescription = styled.span`
  ${({ theme }) => css`
    color: ${theme.colors.gullGray};
    text-align: left;
    font-size: ${theme.fonts.base};
    line-height: normal;
  `}
`;

export const EmptyStateInputSection = styled.div`
  ${({ theme }) => css`
    width: 100%;
    align-self: center;

    @media (min-width: ${theme.screens.lg}) {
      width: 60%;
    }
  `}
`;

export const EmptyStateInputWrapper = styled.div`
  ${({ theme }) => css`
    border-radius: 50px;
    border: 1px solid ${theme.colors.athensGray2 || "#E4E6EA"};
    background-color: ${theme.colors.white};
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    width: 100%;

    &:focus-within {
      border: 1px solid
        var(--web-control-styles-main_color, ${theme.colors.mediumPurple});
    }

    input {
      height: 100%;
      width: 100%;
      flex: 1;
      border: none;
      outline: none;
      color: ${theme.colors.ebony};
      font-size: ${theme.fonts.base};
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
      font-family: inherit;
      background: transparent;

      &::placeholder {
        color: ${theme.colors.gullGray};
      }
    }
  `}
`;

export const EmptyStateSendButton = styled.div<{ $disabled?: boolean }>`
  ${({ theme, $disabled }) => css`
    background-color: var(
      --web-control-styles-main_color,
      ${theme.colors.mediumPurple}
    );
    width: 40px;
    height: 40px;
    min-width: 40px;
    cursor: pointer;
    padding: 8px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      fill: ${theme.colors.white};
      width: 24px;
      height: 24px;
    }

    ${
      $disabled &&
      css`
        background-color: ${theme.colors.athensGray3 || "#F2F4F7"};
        cursor: default;

        svg {
          fill: ${theme.colors.gullGray};
        }
      `
    }
  `}
`;

export const EmptyStateNote = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 120px;

    @media (max-width: ${theme.screens.md}) {
      padding: 0 40px;
    }

    @media (max-width: ${theme.screens.sm}) {
      padding: 0 20px;
    }

    span {
      font-size: ${theme.fonts.sm};
      text-align: left;
      font-style: italic;
      color: ${theme.colors.paleSky};
      font-weight: 500;
    }
  `}
`;
