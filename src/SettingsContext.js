import { createContext, useState } from "react";

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [showSettings, setShowSettings] = useState(false);
  const [manualAdvance, setManualAdvance] = useState(false);

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
