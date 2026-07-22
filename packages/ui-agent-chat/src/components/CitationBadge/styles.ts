import styled, { css } from "styled-components";

export const BadgeWrapper = styled.button`
  ${({ theme }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    margin: 0 2px;
    background: ${theme.colors.athensGray2};
    border: none;
    border-radius: 9999px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    color: ${theme.colors.fiord};
    vertical-align: middle;
    transition: background-color 0.15s, color 0.15s;

    &:hover {
      background: ${theme.colors.cornflowerBlue};
      color: ${theme.colors.white};
    }
  `}
`;

export const HoverCard = styled.div`
  ${({ theme }) => css`
    position: relative;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 300px;
    padding: 14px;
    background: ${theme.colors.white};
    border-radius: 10px;
    box-shadow: ${theme.shadows.smallest};
  `}
`;

export const HoverCardRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const HoverCardLabel = styled.span`
  ${({ theme }) => css`
    font-size: ${theme.fonts.xs};
    font-weight: 600;
    color: ${theme.colors.paleSky};
    text-transform: uppercase;
  `}
`;

export const HoverCardValue = styled.span`
  ${({ theme }) => css`
    font-size: ${theme.fonts.sm};
    color: ${theme.colors.ebony};
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  `}
`;

export const TypeBadge = styled.span<{ $type: string }>`
  ${({ theme, $type }) => css`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    text-transform: capitalize;

    ${$type === "knowledge" &&
    css`
      background: ${theme.colors.athensGray2};
      color: ${theme.colors.fiord};
    `}

    ${$type === "atom" &&
    css`
      background: ${theme.colors.selago};
      color: ${theme.colors.mediumPurple};
    `}

    ${$type === "taxonomy" &&
    css`
      background: ${theme.colors.foam};
      color: ${theme.colors.mountainMeadow};
    `}

    ${$type === "role" &&
    css`
      background: ${theme.colors.provincialPink};
      color: ${theme.colors.flamingo};
    `}

    ${$type === "document" &&
    css`
      background: ${theme.colors.athensGray2};
      color: ${theme.colors.fiord};
    `}

    ${$type === "url" &&
    css`
      background: ${theme.colors.lightSkyBlue};
      color: ${theme.colors.royalBlue};
    `}
  `}
`;

export const SimilarityScore = styled.span`
  ${({ theme }) => css`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    background: ${theme.colors.foam};
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    color: ${theme.colors.mountainMeadow};
  `}
`;

export const HoverCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const HoverCardLink = styled.a`
  ${({ theme }) => css`
    font-size: ${theme.fonts.xs};
    color: ${theme.colors.royalBlue};
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;

    &:hover {
      text-decoration: underline;
    }
  `}
`;

export const HoverCardOpenButton = styled.button`
  ${({ theme }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 8px 12px;
    background-color: var(
      --web-control-styles-main_color,
      ${theme.colors.indigo}
    );
    color: ${theme.colors.white};
    border: none;
    border-radius: 6px;
    font-size: ${theme.fonts.xs};
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s;
    margin-top: 4px;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    svg {
      width: 14px;
      height: 14px;
    }
  `}
`;
