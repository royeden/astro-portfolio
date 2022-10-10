export const IS_IN_CLIENT = !import.meta.env.SSR;

export const REDUCED_MOTION = IS_IN_CLIENT && window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
