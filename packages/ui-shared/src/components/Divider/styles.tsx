import styled, { css } from "styled-components";
import { Theme } from "../../theme";

export interface IWrapperProps {
  width?: string;
  height?: string;
  margin?: string;
  color?: keyof Theme["colors"];
  type?: "normal" | "dot";
}

export const Wrapper: any = styled.div<IWrapperProps>`
  ${({ theme, width, height, margin, color, type }) => css`
    width: ${width || "1px"};
    height: ${height || "100%"};
    background-color: ${color ? theme.colors[color] : theme.colors.athensGray4};
    margin: ${margin || "0"};

    ${
      type === "dot" &&
      css`
        border-radius: 50%;
        width: 4px;
        height: 4px;
        background-color: ${color ? theme.colors[color] : theme.colors.silver};
      `
    }
  `}
`;
