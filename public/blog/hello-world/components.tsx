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
      className="w-full flex flex-col justify-center items-center bg-forest-700 rounded disabled:bg-forest-800"
    >
      {hasConfeti ? "🎉" : null} yay {hasConfeti ? "🎉" : null}
      <ConfettiExplosion active={hasConfeti} config={confettiConfig} />
    </button>
  );
}
