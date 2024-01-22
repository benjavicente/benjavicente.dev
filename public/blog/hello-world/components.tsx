"use client";

import { useState } from "react";

import { default as ConfettiExplosion, ConfettiConfig } from "react-dom-confetti";

const confettiConfig: ConfettiConfig = {
	startVelocity: 20,
};

export function Confetti() {
	const [hasConfeti, setHasConfeti] = useState(false);

	return (
		<button
			onClick={() => {
				setHasConfeti(true);
				setTimeout(() => setHasConfeti(false), 300);
			}}
			disabled={hasConfeti}
			className="flex w-full flex-col items-center justify-center rounded bg-forest-700 disabled:bg-forest-800"
		>
			{hasConfeti ? "🎉" : null} yay {hasConfeti ? "🎉" : null}
			<ConfettiExplosion active={hasConfeti} config={confettiConfig} />
		</button>
	);
}
