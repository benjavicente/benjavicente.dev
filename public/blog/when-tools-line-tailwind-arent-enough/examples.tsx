"use client";
import * as Card from "./card";

import { useEffect, useState, useSyncExternalStore } from "react";

function useMediaQuery(query: string, serverValue = false): boolean {
	return useSyncExternalStore(
		(listener) => {
			const mediaQueryList = window.matchMedia(query);
			mediaQueryList.addEventListener("change", listener);
			return () => mediaQueryList.removeEventListener("change", listener);
		},
		() => {
			const mediaQueryList = window.matchMedia(query);
			return mediaQueryList.matches;
		},
		() => serverValue,
	);
}

export function Responsive() {
	const isHorizontal = useMediaQuery("(min-width: 768px)");

	return (
		<Card.Root horizontal={isHorizontal}>
			<Card.Title>Card</Card.Title>
			<Card.Divider />
			<Card.Content>This is the card implemented as above.</Card.Content>
		</Card.Root>
	);
}
