"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh() {
  const router = useRouter();

  const refreshRef = useRef(router.refresh);

  useEffect(() => (refreshRef.current = router.refresh), [router.refresh]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");
    ws.onmessage = (event) => {
      if (event.data === "refresh") refreshRef.current();
    };
    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
      if (ws.readyState === WebSocket.CONNECTING) ws.onopen = () => ws.close();
    };
  }, []);

  return null;
}
