import { IS_IN_CLIENT, REDUCED_MOTION } from "~constants/mediaQueries";

const main = IS_IN_CLIENT && (document.querySelector("main") as HTMLElement);

export const TRANSITION_PARAM_KEY = "transition";

export function pageTransitionIn() {
  const search = new URLSearchParams(window.location.search);
  const wouldChange = main.style.willChange;
  function cleanupTransitionStyles() {
    main.style.height = "auto";
    main.style.opacity = "1";
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(TRANSITION_PARAM_KEY);
    const search = searchParams.toString();
    window.history.replaceState(
      null,
      "",
      search
        ? `${window.location.pathname}?${search}`
        : window.location.pathname
    );
    main.style.willChange = wouldChange;
  }
  if (search.get(TRANSITION_PARAM_KEY)) {
    if (REDUCED_MOTION) {
      cleanupTransitionStyles();
    } else {
      main.style.willChange = "height";
      const pageInAnimation = main.animate(
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
      pageInAnimation.oncancel = () => cleanupTransitionStyles();
      pageInAnimation.onfinish = () => cleanupTransitionStyles();
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
      main.style.willChange = "height";
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
        (window.location.assign(`${href}?${TRANSITION_PARAM_KEY}=true`));
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
      link.href.includes(import.meta.env.BASE_URL) && !link.href.includes("#")
  );
}

export function addPageTransitionLink(link: HTMLAnchorElement) {
  link.addEventListener("click", pageTransitionOut);
}

export function removePageTransitionLink(link: HTMLAnchorElement) {
  link.removeEventListener("click", pageTransitionOut);
}
