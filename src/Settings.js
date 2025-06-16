import ReactSlider from "react-slider";
import "./slider.css";
import { useContext } from "react";
import SettingsContext from "./SettingsContext";
import BackButton from "./BackButton";

function Settings() {
  const settingsInfo = useContext(SettingsContext);
  return (
    <div style={{ textAlign: "left" }}>
      <label>Work: {settingsInfo.workMinutes} Minutes</label>
      <ReactSlider
        className={"slider"}
        thumbClassName={"thumb"}
        trackClassName={"track"}
        value={settingsInfo.workMinutes}
        onChange={(newValue) => settingsInfo.setWorkMinutes(newValue)}
        min={1}
        max={120}
      />
      <label>Break: {settingsInfo.breakMinutes} Minutes</label>
      <ReactSlider
        className={"slider green"}
        thumbClassName={"thumb"}
        trackClassName={"track"}
        value={settingsInfo.breakMinutes}
        onChange={(newValue) => settingsInfo.setBreakMinutes(newValue)}
        min={1}
        max={25}
      />
      <label>Long Break: {settingsInfo.longBreakMinutes} Minutes</label>
      <ReactSlider
        className={"slider green"}
        thumbClassName={"thumb"}
        trackClassName={"track"}
        value={settingsInfo.longBreakMinutes}
        onChange={(newValue) => settingsInfo.setLongBreakMinutes(newValue)}
        min={3}
        max={100}
      />

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <BackButton onClick={() => settingsInfo.setShowSettings(false)} />
      </div>
    </div>
  );
}

export default Settings;
