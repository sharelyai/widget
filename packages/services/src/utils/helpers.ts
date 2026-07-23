export function setCSSVariables(stylesObj: Record<string, any>, prefix = "") {
  let cssVariables = "";

  for (const [key, value] of Object.entries(stylesObj)) {
    const varKey = `${prefix}${key}`.replace(/([A-Z])/g, "-$1").toLowerCase();
    if (typeof value === "object") {
      cssVariables += setCSSVariables(value, varKey + "-");
    } else if (varKey && value) {
      cssVariables += `--${varKey}: ${value};\n`;
    }
  }

  if (prefix) {
    return cssVariables;
  }

  const styleElement = document.createElement("style");
  styleElement.innerHTML = `:root {\n${cssVariables}}\n`;
  document.head.appendChild(styleElement);

  return cssVariables;
}
