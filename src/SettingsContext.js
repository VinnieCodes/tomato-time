import { useEffect, createContext, useState } from "react";

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  const getInitialValue = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  };

  const [workMinutes, setWorkMinutes] = useState(() =>
    getInitialValue("workMinutes", 25)
  );
  const [breakMinutes, setBreakMinutes] = useState(() =>
    getInitialValue("breakMinutes", 5)
  );
  const [longBreakMinutes, setLongBreakMinutes] = useState(() =>
    getInitialValue("longBreakMinutes", 15)
  );
  const [showSettings, setShowSettings] = useState(false);
  const [manualAdvance, setManualAdvance] = useState(() =>
    getInitialValue("manualAdvance", true)
  );
  
  useEffect(() => {
    localStorage.setItem('workMinutes', JSON.stringify(workMinutes));
  }, [workMinutes])
  useEffect(() => {
    localStorage.setItem("breakMinutes", JSON.stringify(breakMinutes));
  }, [breakMinutes]);
  useEffect(() => {
    localStorage.setItem("longBreakMinutes", JSON.stringify(longBreakMinutes));
  }, [longBreakMinutes]);
  useEffect(() => {
    localStorage.setItem("manualAdvance", JSON.stringify(manualAdvance));
  }, [manualAdvance]);

  return (
    <SettingsContext.Provider
      value={{
        workMinutes,
        setWorkMinutes,
        breakMinutes,
        setBreakMinutes,
        longBreakMinutes,
        setLongBreakMinutes,
        showSettings,
        setShowSettings,
        manualAdvance,
        setManualAdvance,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export default SettingsContext;
