import 'styled-components';

// You might need to duplicate the Theme interface here if you can't import the type easily
// or if you want to strictly decouple.
// For now, I'll try to infer it or just declare the structure I need.

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      white: string;
      paleSky: string;
      electricViolet: string;
      gullGray: string;
      fiord: string;
      mineShaft: string;
      alto: string;
      athensGray: string;
      athensGray2: string;
      athensGray3: string;
      athensGray4: string;
      black: string;
      lilyWhite: string;
      whitePointer: string;
      ebony: string;
      mischka: string;
      blueChalk: string;
      flamingo: string;
      jade: string;
      whiteLilac: string;
      whiteLilac2: string;
      indigo: string;
      beeswax: string;
      korma: string;
      zuccini: string;
      scandal: string;
      amethyst: string;
      titanWhite: string;
      purple: string;
      mediumPurple: string;
      transparent: string;
      OxfordBlue: string;
      shuttleGray: string;
      shark: string;
      alabaster: string;
      silver: string;
      pearl: string;
      mercury: string;
      thunderbird: string;
      mischkaLight: string;
      athensGray5: string;
      athensGray6: string;
      gallery: string;
      apple: string;
      ebonyClay: string;
      primary: string;
      secondary: string;
      selago: string;
      provincialPink: string;
      foam: string;
      funGreen: string;
      royalBlue: string;
      california: string;
      earlyDawn: string;
      magnolia: string;
      whitePointer2: string;
      whitePointer3: string;
      seance: string;
      heliotrope: string;
      mauve: string;
      cinderella: string;
      red: string;
      porcelain: string;
      purpleHeart: string;
      lavenderMist: string;
      almond: string;
      mistyLavender: string;
      softSkyGray: string;
      lightSkyBlue: string;
      deepSkyBlue: string;
      mountainMeadow: string;
      midnightBlue: string;
      balticSea: string;
      cinnabar: string;
      vesuvius: string;
      mysticLavender: string;
      mirage: string;
      codGray: string;
      moonRaker: string;
      cinnabar2: string;
      selectiveYellow: string;
      cornflowerBlue: string;
      [key: string]: string;
    };
    fonts: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      "2xl": string;
      "3xl": string;
      "4xl": string;
      "5xl": string;
      "6xl": string;
      "7xl": string;
      "8xl": string;
      "9xl": string;
    };
    shadows: {
      lowDepthShadow: string;
      smallest: string;
      small: string;
      medium: string;
    };
    screens: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      "2xl": string;
    };
  }
}
