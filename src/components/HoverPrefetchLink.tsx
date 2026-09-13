"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

type Props = ComponentProps<typeof Link>;

// https://nextjs.org/docs/app/guides/prefetching#hover-triggered-prefetch
// No built-in "prefetch on intent" prop. Hand prefetch back to Link after intent so it owns cache invalidation.
export function HoverPrefetchLink({ href, children, onMouseEnter, onFocus, ...props }: Props) {
	const [active, setActive] = useState(false);

	return (
		<Link
			{...props}
			href={href}
			prefetch={active ? null : false}
			onMouseEnter={(event) => {
				onMouseEnter?.(event);
				setActive(true);
			}}
			onFocus={(event) => {
				onFocus?.(event);
				setActive(true);
			}}
		>
			{children}
		</Link>
	);
}
