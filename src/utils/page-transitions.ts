import Highway from "@dogstudio/highway";

import { REDUCED_MOTION } from "~constants/mediaQueries";

// TODO reload in dev mode
class HeightTransition extends Highway.Transition {
  in({
    from,
    to,
    done,
  }: {
    from: HTMLDivElement;
    to: HTMLDivElement;
    done: () => void;
  }) {
    // Reset Scroll
    window.scrollTo(0, 0);

    const fromHeight = getComputedStyle(from).height;

    // Remove Old View
    from.remove();

    if (REDUCED_MOTION.matches) return done();

    const height = getComputedStyle(to).height;
    const pixelHeight = parseInt(height.replace("px", ""), 10);

    // Animation
    const animation = to.animate(
      [
        { opacity: 0, height: fromHeight },
        { opacity: 0, height },
        { opacity: 1 },
      ],
      {
        duration: Math.min(Math.max(500 * (pixelHeight / 2500), 500), 800),
        // easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        easing: "ease-in",
        fill: "forwards",
      }
    );

    // By default we disable transitions
    animation.finished
      .then(() => {
        // TODO If we reload the page, we don't need this check
        // if (document.getElementById("content")) {
        document.body.focus();
        // }
        return;
      })
      .then(() => done());
  }

  out({ from, done }: { from: HTMLDivElement; done: () => void }) {
    // Reset Scroll
    window.scrollTo(0, 0);

    if (REDUCED_MOTION.matches) return done();

    const height = getComputedStyle(from).height;
    const pixelHeight = parseInt(height.replace("px", ""), 10);
    const nextHeight = `${Math.min(
      window.innerHeight - (document.body.clientHeight - pixelHeight),
      pixelHeight
    )}px`;

    // Animation
    const animation = from.animate(
      [
        { opacity: 1, height },
        { opacity: 0, height: nextHeight },
        // { opacity: 0, height: `${pixelHeight / 2}px` },
        // { opacity: 0, height: 0 },
      ],
      {
        duration: Math.min(Math.max(500 * (pixelHeight / 2500), 500), 800),
        // easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        easing: "ease-out",
        fill: "forwards",
      }
    );
    animation.finished.then(() => done());
  }
}

const HInstance = new Highway.Core({
  transitions: {
    default: HeightTransition,
  },
});

let handler;

export function setupPageTransitions() {
  HInstance.detach(document.querySelectorAll("a"));
  HInstance.attach(
    document.querySelectorAll("a:not([target]):not([data-router-disabled])")
  );
  if (handler) {
    HInstance.off("NAVIGATE_START", handler);
  }
  // Handle script reloading in production
  handler = (event) => {
    // TODO optimize in a nicer fashion
    const fromLinks = Array.from(
      document.querySelectorAll("link")
    ) as HTMLLinkElement[];
    const fromLinksSourced = fromLinks.filter(({ href }) => href);
    const fromLinksSources = fromLinksSourced.map(({ href }) => href);

    const fromScripts = Array.from(document.scripts) as HTMLScriptElement[];
    // const fromScriptsInlined = fromScripts.filter(({ src }) => !src);
    const fromScriptsSourced = fromScripts.filter(({ src }) => src);
    const fromScriptsSources = fromScriptsSourced.map(({ src }) => src);

    const toLinks = Array.from(
      event.to.page.querySelectorAll("link")
    ) as HTMLLinkElement[];
    const toLinksSourced = toLinks.filter(({ href }) => href);

    const toScripts = Array.from(event.to.page.scripts) as HTMLScriptElement[];
    const toScriptsInlined = toScripts.filter(({ src }) => !src);
    const toScriptsSourced = toScripts.filter(({ src }) => src);
    const toScriptsSources = toScriptsSourced.map(({ src }) => src);

    // TODO revise deduplication of link tags
    const removed = fromScriptsSourced.filter(
      ({ src }) => !toScriptsSources.includes(src)
    );
    removed.forEach((node) => node.remove());

    const appendedHeadNodes = [
      ...toLinksSourced.filter(({ href }) => !fromLinksSources.includes(href)),
      ...toScriptsSourced.filter(
        ({ src }) => !fromScriptsSources.includes(src)
      ),
    ];

    const BUSTING_KEY = Date.now();
    appendedHeadNodes.forEach((oldNode, index) => {
      const node = document.createElement(oldNode.tagName);
      for (let i = 0; i < oldNode.attributes.length; i++) {
        // Get Attribute
        const attr = oldNode.attributes[i];
        // Set Attribute
        node.setAttribute(attr.nodeName, attr.nodeValue);
      }

      try {
        // Add cache busting
        const isScript = oldNode.tagName === "SCRIPT";
        const url = new URL(
          (oldNode as HTMLScriptElement)?.src ??
            (oldNode as HTMLLinkElement)?.href
        );
        if (isScript) {
          const CACHE_KEY = `${oldNode.tagName}S-CACHE`;
          const params = new URLSearchParams(url.search);
          params.delete(CACHE_KEY);
          params.append(
            CACHE_KEY,
            (isScript ? BUSTING_KEY + index : "").toString()
          );
          (node as HTMLScriptElement).src = `${
            url.pathname
          }?${params.toString()}`;
        } else {
          (node as HTMLLinkElement).href = url.pathname;
        }

        document.head.appendChild(node);
      } catch (error) {
        // TODO
      }
    });

    toScriptsInlined.forEach((script) => {
      const node = document.createElement("script");
      for (let i = 0; i < script.attributes.length; i++) {
        // Get Attribute
        const attr = script.attributes[i];
        // Set Attribute
        node.setAttribute(attr.nodeName, attr.nodeValue);
      }

      node.innerText = script.innerText;
      script.remove();
      document.body.appendChild(node);
    });
  };
  HInstance.on("NAVIGATE_END", handler);
}
