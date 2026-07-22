"use client";
import { css, styled } from "styled-components";

export const AnchorMarkdownContainer: any = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-block;
  position: relative;
`;

export const AnchorMarkdown: any = styled.span`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    border-radius: 9999px;
    background-color: ${theme.colors.athensGray2};
    cursor: pointer;
    padding: 3px 8px;
    width: 100%;
    height: 21px;
    color: ${theme.colors.fiord};
    font-size: ${theme.fonts.xs};
    font-style: normal;
    font-weight: 500;
    line-height: 120%;
    position: relative;
    max-width: 300px;

    & > span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1 1 0;
      min-width: 0;
      display: block;
    }

    &:hover {
      background-color: ${theme.colors.indigo};
      border: none;
      color: ${theme.colors.white};
    }
  `}
`;

export const AnchorMarkdownChildrenNotCounter: any = styled.span`
  ${({ theme }) => css`
    cursor: pointer;
    color: ${theme.colors.OxfordBlue};
    font-size: ${theme.fonts.base};
    transition: scale 0.3s ease;
    text-decoration: underline;
    font-weight: 500;

    &:hover {
      scale: 0.9;
    }
  `}
`;

export const AnchorBoxWrapper: any = styled.span`
  ${({ theme }) => css`
    padding: 8px 12px;
    background-color: ${theme.colors.white};
    color: ${theme.colors.OxfordBlue};
    text-align: center;
    font-size: ${theme.fonts.xs};
    font-style: normal;
    font-weight: 600;
    line-height: 18px;
    border-radius: 8px;
    box-shadow: ${theme.shadows.smallest};
    position: relative;
    z-index: 100;
    width: max-content;
    max-width: 350px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;

    .anchor-arrow {
      width: 16px;
      height: 6px;
      position: absolute;
      top: -10px;
    }

    .anchor-arrow-down {
      top: initial;
      bottom: 0px;

      & > svg {
        transform: rotate(180deg);
      }
    }
  `}
`;

export const AnchorBoxWrapperReferences: any = styled.span`
  ${({ theme }) => css`
    position: relative;
    z-index: 100;
    display: flex;
    width: 324px;
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    border-radius: 12px;
    background-color: ${theme.colors.white};
    box-shadow: ${theme.shadows.smallest};

    & > .space {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;

      & > .title {
        color: ${theme.colors.ebony};
        font-size: ${theme.fonts.sm};
        font-style: normal;
        font-weight: 700;
        line-height: 120%;
      }

      & > .description {
        color: ${theme.colors.fiord};
        font-size: ${theme.fonts.xs};
        font-style: normal;
        font-weight: 400;
        line-height: 120%;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        max-width: 300px;
        text-align: left;
      }
    }
  `}
`;