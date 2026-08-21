// JS mirror of the motion tokens in `src/app/globals.css` (--duration-*,
// --ease-*, --motion-distance-*), for `motion`/framer-motion components that
// can't read CSS custom properties without `getComputedStyle`. Keep the two
// in sync by hand — src/styles/motion.test.ts asserts the CSS vars exist.
export const duration = {
  instant: 0.08,
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
  slower: 0.7,
} as const;

export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  emphasized: [0.2, 0, 0, 1],
} as const;

export const distance = {
  sm: 8,
  md: 16,
  lg: 32,
} as const;
