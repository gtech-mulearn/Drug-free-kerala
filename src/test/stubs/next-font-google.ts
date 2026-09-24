// Stand-in for `next/font/google` under Vitest (fonts are resolved by the
// Next.js compiler, which tests don't run).
export function Poppins() {
  return {
    className: "font-poppins",
    variable: "font-poppins-variable",
    style: { fontFamily: "Poppins" },
  };
}
