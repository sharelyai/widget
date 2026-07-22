# `@sharelyai/widget-ui-shared`

The shared UI layer: **theme system, base components, and icons**. No API client,
no data hooks. It's a peer dependency of every `ui-*` feature package, so the
`ThemeProvider` wrap shown here is what all the other examples reuse.

**Runnable:** [`/ui-shared`](../apps/demo/src/pages/UiShared.tsx) in the demo app.

## Minimal implementation

Wrap UI in `ThemeProvider` + `GlobalStyle`. Override theme tokens by building off
`defaultTheme`:

```tsx
import {
  ThemeProvider,
  GlobalStyle,
  Button,
  Input,
  Logo,
  defaultTheme,
} from "@sharelyai/widget-ui-shared";

const brandTheme = {
  ...defaultTheme,
  colors: { ...defaultTheme.colors, primary: "#2563EB" }, // tweak the tokens you want
};

export default function App() {
  return (
    <ThemeProvider theme={brandTheme}>
      <GlobalStyle />
      <Logo />
      <Button onClick={() => {}}>A themed button</Button>
      <Input value="" onChange={() => {}} placeholder="A themed input…" />
    </ThemeProvider>
  );
}
```

> Pass `theme={undefined}` to use the default theme as-is.

## Key APIs

| Import                                           | Purpose                                                          |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| `ThemeProvider`                                  | Supplies the styled-components theme; accepts a `theme` override |
| `GlobalStyle`                                    | Base global CSS + font loading                                   |
| `defaultTheme`                                   | The full default token set to spread/override                    |
| `Button`, `Input`, `Logo`, `Tooltip`, `Alert`, … | Base components and icons                                        |
