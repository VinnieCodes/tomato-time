import ReactSlider from "react-slider";
import "./slider.css";
import { useContext } from "react";
import SettingsContext from "./SettingsContext";
import BackButton from "./BackButton";
import Switch from "react-switch"; // Add this import

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
        min={25}
        max={75}
        step={5}
      />
      <label>Break: {settingsInfo.breakMinutes} Minutes</label>
      <ReactSlider
        className={"slider green"}
        thumbClassName={"thumb"}
        trackClassName={"track"}
        value={settingsInfo.breakMinutes}
        onChange={(newValue) => settingsInfo.setBreakMinutes(newValue)}
        min={5}
        max={15}
      />
      <label>Long Break: {settingsInfo.longBreakMinutes} Minutes</label>
      <ReactSlider
        className={"slider green"}
        thumbClassName={"thumb"}
        trackClassName={"track"}
        value={settingsInfo.longBreakMinutes}
        onChange={(newValue) => settingsInfo.setLongBreakMinutes(newValue)}
        min={15}
        max={45}
        step={3}
      />

      <div style={{ margin: "20px 0" }}>
        <label style={{ marginRight: "12px" }}>Manual Advance</label>
        <Switch
          onChange={settingsInfo.setManualAdvance}
          checked={settingsInfo.manualAdvance}
          onColor="#4772fa"
          uncheckedIcon={false}
          checkedIcon={false}
        />
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <BackButton onClick={() => settingsInfo.setShowSettings(false)} />
      </div>
    </div>
  );
}

export default Settings;
