import { IS_IN_CLIENT, REDUCED_MOTION } from "~constants/mediaQueries";

const main = IS_IN_CLIENT && (document.querySelector("main") as HTMLElement);

export function pageTransitionIn() {
  main.animate(
    [
      { opacity: 0, height: 0 },
      { opacity: 0, height: `${main.scrollHeight}px` },
      { opacity: 1, height: "auto" },
    ],
    {
      duration: Math.min(Math.max(500 * (main.scrollHeight / 2500), 500), 800),
      easing: "ease-in",
      fill: "forwards",
    }
  );
}

let pageOutAnimation: Animation | undefined = undefined;

function pageTransitionOut(event: MouseEvent) {
  if (!REDUCED_MOTION) {
    const href = (event.currentTarget as HTMLAnchorElement).href;

    event.preventDefault();

    window.scrollTo(0, 0);

    if (window.location.href !== href) {
      if (pageOutAnimation) pageOutAnimation.cancel();

      pageOutAnimation = main.animate(
        [
          { opacity: 1, height: `${main.clientHeight}px` },
          { opacity: 0, height: 0 },
        ],
        {
          duration: Math.min(
            Math.max(500 * (main.clientHeight / 1500), 500),
            800
          ),
          easing: "ease-in",
          fill: "forwards",
        }
      );

      pageOutAnimation.onfinish = () => (window.location.href = href);
    }
  }
}

export function getAnchorLinks() {
  return (
    Array.from(
      document.querySelectorAll("a[href]:not([target])")
    ) as HTMLAnchorElement[]
  ).filter(
    (link) =>
      !link.href
        .replace(window.location.origin, "")
        .replace(window.location.pathname, "")
        .includes("#")
  );
}

export function addPageTransitionLinks(links: HTMLAnchorElement[]) {
  links.forEach((link: HTMLAnchorElement) =>
    link.addEventListener("click", pageTransitionOut)
  );
}

export function removePageTransitionLinks(links: HTMLAnchorElement[]) {
  links.forEach((link: HTMLAnchorElement) =>
    link.removeEventListener("click", pageTransitionOut)
  );
}
