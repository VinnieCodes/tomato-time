import "./App.css";
import Timer from "./Timer";
import Settings from "./Settings";
import { useContext } from "react";
import SettingsContext, { SettingsProvider } from "./SettingsContext";

function AppContent() {
  const settingsInfo = useContext(SettingsContext);

  const {
    showSettings,
    workMinutes,
    breakMinutes,
    longBreakMinutes,
    mode,
    setMode,
    pomoCount,
    setPomoCount,
  } = settingsInfo;

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

  return showSettings ? (
    <Settings />
  ) : (
    <Timer minutes={minutes} onTimerComplete={onTimerComplete} />
  );
}

function App() {
  return (
    <main>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </main>
  );
}

export default App;
