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
      onClick={() => setHasConfeti(!hasConfeti)}
      className="w-full flex flex-col justify-center items-center bg-forest-800 rounded"
    >
      {hasConfeti ? "🎉" : null} yay {hasConfeti ? "🎉" : null}
      <ConfettiExplosion active={hasConfeti} config={confettiConfig} />
    </button>
  );
}
