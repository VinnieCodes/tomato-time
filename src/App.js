import "./App.css";
import Timer from "./Timer";
import Settings from "./Settings";
import { useContext, useState } from "react";
import SettingsContext from "./SettingsContext";

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [pomoCount, setPomoCount] = useState(0);
  const [mode, setMode] = useState("work"); // "work", "break", "longBreak"
  const [manualAdvance, setManualAdvance] = useState(true);

  let minutes;
  if (mode === "work") {
    minutes = workMinutes;
  } else if (mode === "break") {
    minutes = breakMinutes;
  } else if (mode === "longBreak") {
    minutes = longBreakMinutes;
  }

  function onTimerComplete() {
    if (mode === "work") {
      const nextPomoCount = pomoCount + 1;
      if (nextPomoCount % 4 === 0) {
        setMode("longBreak");
      } else {
        setMode("break");
      }
      setPomoCount(nextPomoCount);
    } else if (mode === "longBreak") {
      setMode("work");
      setPomoCount(0); // Reset after long break
    } else {
      setMode("work");
    }
  }

  return (
    <main>
      <SettingsContext.Provider
        value={{
          showSettings,
          setShowSettings,
          workMinutes,
          setWorkMinutes,
          breakMinutes,
          setBreakMinutes,
          longBreakMinutes,
          setLongBreakMinutes,
          manualAdvance,
          setManualAdvance,
        }}
      >
        {showSettings ? (
          <Settings />
        ) : (
          <Timer minutes={minutes} onTimerComplete={onTimerComplete} />
        )}
      </SettingsContext.Provider>
    </main>
  );
}

export default App;
