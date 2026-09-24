// Stand-in for `next/font/google` under Vitest (fonts are resolved by the
// Next.js compiler, which tests don't run).
const font = (family: string, id: string) => () => ({
  className: `font-${id}`,
  variable: `font-${id}-variable`,
  style: { fontFamily: family },
});

export const Poppins = font("Poppins", "poppins");
export const Inter_Tight = font("Inter Tight", "inter-tight");
export const Bebas_Neue = font("Bebas Neue", "bebas");
export const Noto_Sans_Malayalam = font("Noto Sans Malayalam", "noto-sans-malayalam");
