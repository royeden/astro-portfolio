import { IS_IN_CLIENT, REDUCED_MOTION } from "~constants/mediaQueries";

const main = IS_IN_CLIENT && (document.querySelector("main") as HTMLElement);

export const TRANSITION_PARAM_KEY = "transition";

export function pageTransitionIn() {
  const search = new URLSearchParams(window.location.search);
  if (search.get(TRANSITION_PARAM_KEY)) {
    if (REDUCED_MOTION) {
      main.style.height = "auto";
      main.style.opacity = "1";
    } else {
      main.animate(
        [
          { opacity: 0, height: 0 },
          { opacity: 0, height: `${main.scrollHeight}px` },
          { opacity: 1, height: "auto" },
        ],
        {
          duration: Math.min(
            Math.max(500 * (main.scrollHeight / 2500), 500),
            800
          ),
          easing: "ease-in",
          fill: "forwards",
        }
      );
    }
  }
}

let pageOutAnimation: Animation | undefined = undefined;

function pageTransitionOut(event: MouseEvent) {
  if (!REDUCED_MOTION) {
    const { href, pathname } = event.currentTarget as HTMLAnchorElement;

    event.preventDefault();

    window.scrollTo(0, 0);

    if (window.location.pathname !== pathname) {
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

      pageOutAnimation.onfinish = () =>
        (window.location.href = `${href}?${TRANSITION_PARAM_KEY}=true`);
    }
  }
}

export function getTransitionLinks() {
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

export function addPageTransitionLinks(link: HTMLAnchorElement) {
  link.addEventListener("click", pageTransitionOut);
}

export function removePageTransitionLinks(link: HTMLAnchorElement) {
  link.removeEventListener("click", pageTransitionOut);
}
