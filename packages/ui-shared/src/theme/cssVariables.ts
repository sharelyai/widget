export function setCSSVariables(stylesObj: any, prefix = '') {
  let cssVariables = '';

  // Recursively iterate through the object
  for (const [key, value] of Object.entries(stylesObj)) {
    const varKey = `${prefix}${key}`.replace(/([A-Z])/g, '-$1').toLowerCase(); // Convert camelCase to kebab-case
    if (typeof value === 'object') {
      // Recurse into nested objects
      cssVariables += setCSSVariables(value, varKey + '-');
    } else if (varKey && value) {
      cssVariables += `--${varKey}: ${value};
`;
    }
  }

  if (prefix) {
    return cssVariables;
  }

  // Apply the generated CSS variables directly to the DOM
  const styleElement = document.createElement('style');
  styleElement.innerHTML = `:root {
${cssVariables}}
`;
  document.head.appendChild(styleElement); // Add to the head of the document
}

export function themeToCSSVariables(theme: any, prefix = 'sharely'): Record<string, string> {
  const vars: Record<string, string> = {};

  // Colors
  Object.entries(theme.colors || {}).forEach(([key, value]) => {
    const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    vars[`--${prefix}-color-${kebabKey}`] = value as string;
  });

  // Fonts
  Object.entries(theme.fonts || {}).forEach(([key, value]) => {
    vars[`--${prefix}-font-size-${key}`] = value as string;
  });

  return vars;
}
