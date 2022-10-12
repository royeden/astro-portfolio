/// <reference types="vite/client" />

interface SmartLinkPrimitive {
  obfuscatedContact?: string;
  parsedURL: string;
  ariaLabel?: "telephone number" | "email address";
  rel?: "noopener noreferrer" | "prefetch";
  isExternal: boolean;
}

export interface SmartLinkProps {
  href: string;
  skipPrefetch?: boolean;
}

export interface SmartLinkComputedProps {
  href: SmartLinkPrimitive["parsedURL"];
  "data-contact": SmartLinkPrimitive["obfuscatedContact"];
  "data-router-disabled": boolean;
  "aria-label": SmartLinkPrimitive["ariaLabel"];
  rel: SmartLinkPrimitive["rel"];
  target?: "_blank";
}

export function createSmartLink({
  href = "",
  skipPrefetch,
}: SmartLinkProps): SmartLinkPrimitive {
  const PATH_SEPARATOR = "/";

  const isExternal = href.startsWith("http");
  const isHash = href.startsWith("#");
  const isMail = href.startsWith("mailto:");
  const isTel = href.startsWith("tel:");

  const isContact = isMail || isTel;

  const shouldPrefetch = !skipPrefetch && !isHash && !isContact;

  const obfuscatedContact = isContact ? btoa(href) : undefined;

  const parsedURL =
    isHash || isExternal
      ? href
      : isContact
      ? "#"
      : `/${[
          ...import.meta.env.BASE_URL.split(PATH_SEPARATOR),
          ...href.split(PATH_SEPARATOR),
        ]
          .filter((link) => link)
          .join(PATH_SEPARATOR)}`;

  const ariaLabel = isTel
    ? "telephone number"
    : isMail
    ? "email address"
    : undefined;

  const rel = isExternal
    ? "noopener noreferrer"
    : shouldPrefetch
    ? "prefetch"
    : undefined;

  return {
    obfuscatedContact,
    parsedURL,
    ariaLabel,
    rel,
    isExternal,
  };
}

export function getSmartLinkProps({
  parsedURL,
  obfuscatedContact,
  ariaLabel,
  rel,
  isExternal,
}: SmartLinkPrimitive): SmartLinkComputedProps {
  return {
    href: parsedURL,
    "data-contact": obfuscatedContact,
    "data-router-disabled": !!obfuscatedContact,
    "aria-label": ariaLabel,
    rel,
    target: isExternal ? "_blank" : undefined,
  };
}

export function handleSmartLinkClick<T extends MouseEvent>(
  event: T & { currentTarget: HTMLAnchorElement }
) {
  const contactHrefRaw = event.currentTarget.getAttribute("data-contact");
  if (contactHrefRaw) {
    const contactHref = atob(contactHrefRaw);
    window.location.href = contactHref;
  }
}
