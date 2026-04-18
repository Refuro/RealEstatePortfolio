"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Page() {
  const [timerOn, setTimerOn] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    function updateTick() {
      setTick(tick + 1);
    }

    if (timerOn) {
      setInterval(updateTick, 1000);
    }
    return () => {};
  }, [timerOn]);

  return (
    <div className="text-center">
      <Link href="/learn/react-labs">Back to react-labs</Link>
      <br />
      <br />
      <div>
        <p>Timer: {tick}</p>
        <button type="button" onClick={() => setTimerOn(false)}>
          Stop Timer
        </button>
      </div>
    </div>
  );
}
