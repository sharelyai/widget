import { ChangeEvent, useState } from "react";
import {
  ThemeProvider,
  GlobalStyle,
  Button,
  Input,
  Logo,
  defaultTheme,
} from "@sharelyai/widget-ui-shared";

// Standalone @sharelyai/widget-ui-shared: theme system + base components + icons.
// No data layer / SharelyProvider needed — just a ThemeProvider. Build a theme
// override off defaultTheme and tweak the tokens you care about.
const brandTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: "#2563EB", // override the default violet with a blue
    secondary: "#93C5FD",
  },
};

function UiShared() {
  const [useBrand, setUseBrand] = useState(false);
  const [value, setValue] = useState("");

  return (
    <ThemeProvider theme={useBrand ? brandTheme : undefined}>
      <GlobalStyle />
      <div style={{ padding: "20px", maxWidth: 480, margin: "0 auto" }}>
        <h2>UI Shared Demo</h2>
        <p>Theme system + base components + icons, with no data layer.</p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "24px 0",
          }}
        >
          <Logo />
          <Button onClick={() => setUseBrand((v) => !v)}>
            {useBrand ? "Use default theme" : "Use brand theme"}
          </Button>
        </div>

        <Input
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setValue(e.target.value)
          }
          placeholder="A themed Input from ui-shared…"
        />

        <p style={{ marginTop: 16 }}>
          Active primary color:{" "}
          <code>
            {useBrand ? brandTheme.colors.primary : "#A217D8 (default)"}
          </code>
        </p>
      </div>
    </ThemeProvider>
  );
}

export default UiShared;
