/// <reference types="astro/astro-jsx" />

export default function normalizeAstroClassListProps<
  T extends astroHTML.JSX.HTMLAttributes
>({
  class: className,
  "class:list": classList,
  ...props
}: T): Omit<T, "class" | "class:list"> & {
  classList: astroHTML.JSX.HTMLAttributes["class:list"];
} {
  return { classList: [className, classList], ...props };
}
