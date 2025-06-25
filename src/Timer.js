import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import PlayButton from "./PlayButton";
import PauseButton from "./PauseButton";
import SettingsButton from "./SettingsButton";
import { useContext, useState, useEffect, useRef, useCallback } from "react";
import SettingsContext from "./SettingsContext";
import {
  workCompleteSound,
  breakCompleteSound,
  clickSound,
} from "./SoundEffects";
import TaskForm from "./TaskForm";
import Task from "./Task";
import TotalFocus from "./TotalFocus";
import Statistics from "./Statistics";

const blue = "#4772fa";
const green = "#1bddac";

function Timer() {
  const settingsInfo = useContext(SettingsContext);

  const [isPaused, setIsPaused] = useState(true);
  const [mode, setMode] = useState("work"); // work, break, longBreak
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [pomoCount, setPomoCount] = useState(0); // Track completed work sessions
  const [waitingForAdvance, setWaitingForAdvance] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const secondsLeftRef = useRef(secondsLeft);
  const isPausedRef = useRef(isPaused);
  const modeRef = useRef(mode);
  const pomoCountRef = useRef(pomoCount);

  const switchMode = useCallback(() => {
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
  }, [
    settingsInfo.breakMinutes,
    settingsInfo.longBreakMinutes,
    settingsInfo.workMinutes,
  ]);

  function tick() {
    secondsLeftRef.current--;
    setSecondsLeft(secondsLeftRef.current);

    if (modeRef.current === "work") {
      const todayKey = new Date().toISOString().slice(0, 10);
      const focusData = JSON.parse(localStorage.getItem("focusData") || "{}");

      focusData[todayKey] = (focusData[todayKey] || 0) + 1; // +1 second
      localStorage.setItem("focusData", JSON.stringify(focusData));

      // Optional: update totalFocusMinutes too if you use it elsewhere
      const totalFocus = parseInt(
        localStorage.getItem("totalFocusMinutes") || "0",
        10
      );
      localStorage.setItem("totalFocusMinutes", (totalFocus + 1).toString());
    }
  }

  const initTimer = useCallback(() => {
    setMode("work");
    modeRef.current = "work";
    setSecondsLeft(settingsInfo.workMinutes * 60);
    secondsLeftRef.current = settingsInfo.workMinutes * 60;
    setPomoCount(0);
    pomoCountRef.current = 0;
  }, [settingsInfo.workMinutes]);

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
  }, [settingsInfo, switchMode, initTimer]);

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

  return (
    <div>
      <button
        style={{
          padding: "4px",
          width: "auto",
          position: "absolute",
          fontSize: "1em",
          top: 2,
          right: 2,
        }}
        onClick={() => setShowChart(true)}
      >
        Stats
      </button>
      {showChart && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowChart(false)} // close on background click
        >
          <div
            style={{
              width: "90%",
              minWidth: "500px",
              maxWidth: "600px",
              backgroundColor: "rgba(36, 36, 36, 0.96)",
              padding: "10px 0px 50px 10px",
              borderRadius: "20px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
          >
            <Statistics /> {/* your chart component */}
          </div>
        </div>
      )}

      <TotalFocus
        workActive={mode === "work" ? settingsInfo.workMinutes : null}
        workSecondsLeft={mode === "work" ? secondsLeft : 0}
        waitingForAdvance={waitingForAdvance}
      />
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
