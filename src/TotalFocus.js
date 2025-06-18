import { useState, useEffect, useRef } from "react";

function TotalFocus({ workActive, workSecondsLeft, waitingForAdvance }) {
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(() => {
    const stored = localStorage.getItem("totalFocusMinutes");
    return stored ? parseInt(stored, 10) : 0;
  });
  const [resetAnim, setResetAnim] = useState(false);
  const [lastWorkSessionId, setLastWorkSessionId] = useState(null);
  const [lastMinute, setLastMinute] = useState(null);
  const holdTimeout = useRef(null);

  // Detect new work session and reset lastMinute
  useEffect(() => {
    if (workActive && !waitingForAdvance) {
      // Use a session id based on workActive and workSecondsLeft increasing (new session)
      const sessionId = `${workActive}-${
        workSecondsLeft > 0 ? "active" : "done"
      }`;
      if (lastWorkSessionId !== sessionId) {
        setLastMinute(Math.floor((workActive * 60 - workSecondsLeft) / 60));
        setLastWorkSessionId(sessionId);
      }
      const totalWorkSeconds = workActive * 60;
      const currentMinute = Math.floor(
        (totalWorkSeconds - workSecondsLeft) / 60
      );
      if (lastMinute === null) {
        setLastMinute(currentMinute);
      } else if (currentMinute > lastMinute) {
        const minutesToAdd = currentMinute - lastMinute;
        if (minutesToAdd > 0) {
          const newTotal = totalFocusMinutes + minutesToAdd;
          setTotalFocusMinutes(newTotal);
          localStorage.setItem("totalFocusMinutes", newTotal);
          setLastMinute(currentMinute);
        }
      }
    }
    if (!workActive || waitingForAdvance) {
      setLastMinute(null);
      setLastWorkSessionId(null);
    }
    // eslint-disable-next-line
  }, [workActive, workSecondsLeft, waitingForAdvance]);

  // Reset total focus time with hold
  function handleFocusTimeMouseDown() {
    setResetAnim(true);
    holdTimeout.current = setTimeout(() => {
      setTotalFocusMinutes(0);
      localStorage.setItem("totalFocusMinutes", 0);
      setTimeout(() => setResetAnim(false), 600);
    }, 1000);
  }

  function handleFocusTimeMouseUp() {
    clearTimeout(holdTimeout.current);
    setResetAnim(false);
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 1,
        left: 1,
        color: resetAnim ? "#d32f2f" : "#fff",
        fontWeight: "bold",
        fontSize: "1em",
        zIndex: 10,
        background: "transparent",
        padding: "2px 4px",
        transition: "color 0.5s",
        cursor: "pointer",
        userSelect: "none",
      }}
      onMouseDown={handleFocusTimeMouseDown}
      onMouseUp={handleFocusTimeMouseUp}
      onMouseLeave={handleFocusTimeMouseUp}
      title="Hold to reset"
    >
      Total Focus Time: {totalFocusMinutes} minutes
    </div>
  );
}

export default TotalFocus;
