"use client";

import { default as NextLink } from "next/link";
import { usePathname } from "next/navigation";

type LinkProps = Parameters<typeof NextLink>[0] & { activeClassName?: string };

function extractPathname(href: LinkProps["href"]) {
  if (typeof href === "string") return href;
  return href.pathname;
}

export function ActiveAwareLink({ className, activeClassName, ...props }: LinkProps) {
  const pathname = usePathname();
  const isActive = pathname === extractPathname(props.href);
  const finalClassName = isActive ? `${className} ${activeClassName}` : className;
  return <NextLink className={finalClassName} {...props} />;
}
