"use client";
import { css, styled } from "styled-components";

export const LiAnchorMarkdown: any = styled.li`
  ${() => css`
    & > a {
      display: inline-flex;
    }
  `}
`;
