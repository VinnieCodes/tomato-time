import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import PlayButton from "./PlayButton";
import PauseButton from "./PauseButton";
import SettingsButton from "./SettingsButton";
import { useContext, useState, useEffect, useRef } from "react";
import SettingsContext from "./SettingsContext";
import {
  workCompleteSound,
  breakCompleteSound,
  clickSound,
} from "./SoundEffects";
import TaskForm from "./TaskForm";
import Task from "./Task";

const blue = "#4772fa";
const green = "#1bddac";

function Timer() {
  const settingsInfo = useContext(SettingsContext);

  const [isPaused, setIsPaused] = useState(true);
  const [mode, setMode] = useState("work"); // work, break, longBreak
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [pomoCount, setPomoCount] = useState(0); // Track completed work sessions
  const [waitingForAdvance, setWaitingForAdvance] = useState(false);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(() => {
    const stored = localStorage.getItem("totalFocusMinutes");
    return stored ? parseInt(stored, 10) : 0;
  });
  const [lastPausedSeconds, setLastPausedSeconds] = useState(null);
  const [resetAnim, setResetAnim] = useState(false);

  const secondsLeftRef = useRef(secondsLeft);
  const isPausedRef = useRef(isPaused);
  const modeRef = useRef(mode);
  const pomoCountRef = useRef(pomoCount);
  const holdTimeout = useRef(null);

  function switchMode() {
    if (modeRef.current === "work") {
      const nextPomoCount = pomoCountRef.current + 1;
      if (nextPomoCount % 4 === 0) {
        setMode("longBreak");
        modeRef.current = "longBreak";
        setSecondsLeft(settingsInfo.longBreakMinutes * 60);
        secondsLeftRef.current = settingsInfo.longBreakMinutes * 60;
        setPomoCount(nextPomoCount);
        pomoCountRef.current = nextPomoCount;
      } else {
        setMode("break");
        modeRef.current = "break";
        setSecondsLeft(settingsInfo.breakMinutes * 60);
        secondsLeftRef.current = settingsInfo.breakMinutes * 60;
        setPomoCount(nextPomoCount);
        pomoCountRef.current = nextPomoCount;
      }
    } else if (modeRef.current === "longBreak") {
      setMode("work");
      modeRef.current = "work";
      setSecondsLeft(settingsInfo.workMinutes * 60);
      secondsLeftRef.current = settingsInfo.workMinutes * 60;
      setPomoCount(0);
      pomoCountRef.current = 0;
    } else {
      setMode("work");
      modeRef.current = "work";
      setSecondsLeft(settingsInfo.workMinutes * 60);
      secondsLeftRef.current = settingsInfo.workMinutes * 60;
    }
    setWaitingForAdvance(false); // reset waiting state on mode switch
  }

  function tick() {
    secondsLeftRef.current--;
    setSecondsLeft(secondsLeftRef.current);
  }

  function initTimer() {
    setMode("work");
    modeRef.current = "work";
    setSecondsLeft(settingsInfo.workMinutes * 60);
    secondsLeftRef.current = settingsInfo.workMinutes * 60;
    setPomoCount(0);
    pomoCountRef.current = 0;
  }

  function handleNext() {
    switchMode();
    setIsPaused(false);
    isPausedRef.current = false;
    setWaitingForAdvance(false);
  }

  function handleManualAdvance() {
    switchMode();
    setIsPaused(false);
    isPausedRef.current = false;
    setWaitingForAdvance(false);
  }

  useEffect(() => {
    initTimer();
    const interval = setInterval(() => {
      if (isPausedRef.current) {
        return;
      }
      // Play sound when timer is at 1 second left (about to hit 0)
      if (secondsLeftRef.current === 1) {
        if (modeRef.current === "work") {
          workCompleteSound();
        } else {
          breakCompleteSound();
        }
      }
      if (secondsLeftRef.current === 0) {
        if (settingsInfo.manualAdvance) {
          setWaitingForAdvance(true);
          setIsPaused(true);
          isPausedRef.current = true;
          return;
        }
        return switchMode();
      }
      tick();
    }, 50);

    return () => clearInterval(interval);
  }, [settingsInfo]);

  const totalSeconds =
    mode === "work"
      ? settingsInfo.workMinutes * 60
      : mode === "break"
      ? settingsInfo.breakMinutes * 60
      : settingsInfo.longBreakMinutes * 60;

  const percentage = Math.round((secondsLeft / totalSeconds) * 100);
  const minutes = Math.floor(secondsLeft / 60);
  let seconds = secondsLeft % 60;
  if (seconds < 10) seconds = "0" + seconds;

  // Update document title with timer
  useEffect(() => {
    document.title = `${minutes}:${seconds} • ${
      mode === "work" ? "Focus" : "Relax"
    } `;
    const setFavicon = (iconPath) => {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = iconPath;
    };

    if (mode === "work") {
      setFavicon("/favicon-work.ico");
    } else {
      setFavicon("/favicon-break.ico");
    }
  }, [minutes, seconds, mode]);

  // tasks
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (tasks.length === 0) return;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(tasks);
  }, []);

  function addTask(name) {
    if (!name.trim()) return;
    setTasks((prev) => {
      return [...prev, { name: name, done: false }];
    });
  }

  function removeTask(indexToRemove) {
    setTasks((prev) => {
      return prev.filter((taskObject, index) => index !== indexToRemove);
    });
  }

  function updateTaskDone(taskIndex, newDone) {
    setTasks((prev) => {
      const newTasks = [...prev];
      newTasks[taskIndex].done = newDone;
      return newTasks;
    });
  }

  const numberComplete = tasks.filter((t) => t.done).length;
  const numberTotal = tasks.length;

  function getMessage() {
    if (numberTotal === 0) {
      return "Make a task!";
    }
    const percentage = (numberComplete / numberTotal) * 100;
    if (percentage === 0) {
      return "Do at least one!";
    }
    if (percentage === 100) {
      return "Great job today!⚡";
    }
    return "Keep it going 🦾";
  }

  function renameTask(index, newName) {
    setTasks((prev) => {
      const newTasks = [...prev];
      newTasks[index].name = newName;
      return newTasks;
    });
  }

  // Track last minute mark for focus update
  const [lastFocusMinute, setLastFocusMinute] = useState(null);

  useEffect(() => {
    // Only update in work mode, not paused, and not waiting for advance
    if (mode === "work" && !isPaused && !waitingForAdvance) {
      const currentMinute = Math.floor(
        (settingsInfo.workMinutes * 60 - secondsLeft) / 60
      );
      if (lastFocusMinute === null) {
        setLastFocusMinute(currentMinute);
      } else if (currentMinute > lastFocusMinute) {
        const minutesToAdd = currentMinute - lastFocusMinute;
        if (minutesToAdd > 0) {
          const newTotal = totalFocusMinutes + minutesToAdd;
          setTotalFocusMinutes(newTotal);
          localStorage.setItem("totalFocusMinutes", newTotal);
          setLastFocusMinute(currentMinute);
        }
      }
    }
    // Reset lastFocusMinute when mode changes or timer is paused
    if (isPaused || mode !== "work" || waitingForAdvance) {
      setLastFocusMinute(null);
    }
    // eslint-disable-next-line
  }, [secondsLeft, isPaused, mode, waitingForAdvance]);

  // Reset total focus time with hold
  function handleFocusTimeMouseDown() {
    setResetAnim(true); // Start animation immediately on mouse down
    holdTimeout.current = setTimeout(() => {
      setTotalFocusMinutes(0);
      localStorage.setItem("totalFocusMinutes", 0);
      setTimeout(() => setResetAnim(false), 600); // animation duration after reset
    }, 1000); // 1 seconds hold
  }

  function handleFocusTimeMouseUp() {
    clearTimeout(holdTimeout.current);
    setResetAnim(false); // Cancel animation if released early
  }

  return (
    <div>
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
      <CircularProgressbar
        value={percentage}
        text={minutes + ":" + seconds}
        styles={buildStyles({
          rotation: 0,
          strokeLinecap: "round",
          textColor: "#fff",
          pathColor: mode === "work" ? blue : green,
          trailColor: "rgba(255, 255, 255, .2)",
        })}
      />
      <div style={{ marginTop: "20px" }}>
        {waitingForAdvance ? (
          <PlayButton
            onClick={() => {
              clickSound();
              handleManualAdvance();
            }}
          />
        ) : isPaused ? (
          <PlayButton
            onClick={() => {
              clickSound();
              setIsPaused(false);
              isPausedRef.current = false;
            }}
          />
        ) : (
          <PauseButton
            onClick={() => {
              clickSound();
              setIsPaused(true);
              isPausedRef.current = true;
            }}
          />
        )}
      </div>
      <div style={{ marginTop: "20px" }}>
        <SettingsButton onClick={() => settingsInfo.setShowSettings(true)} />
      </div>
      <div>
        <h1>
          {numberComplete}/{numberTotal} Complete
        </h1>
        <h2>{getMessage()}</h2>
        <TaskForm onAdd={addTask} />
        {tasks.map((task, index) => (
          <Task
            {...task}
            onRename={(newName) => renameTask(index, newName)}
            onTrash={() => removeTask(index)}
            onToggle={(done) => updateTaskDone(index, done)}
          />
        ))}
      </div>
    </div>
  );
}

export default Timer;
