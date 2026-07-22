import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
#sharelyai-webcontroller-id {
  * {
      box-sizing: border-box;
      font-family: var(--web-control-styles-font_family, 'Plus Jakarta Sans', sans-serif);
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      font-weight: initial;
      margin: 0;
      padding: 0;
    }

    li {
      color: #101828;
      font-size: 16px;
      font-weight: 400;
      line-height: 28px;
    }

    a {
      text-decoration: none;
    }
  }
`;
