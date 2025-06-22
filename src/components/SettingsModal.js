import React from 'react';
import '../styles/SettingsModal.css';

const SettingsModal = ({ theme, setTheme, soundOn, setSoundOn, resetScores, close }) => {
  return (
    <div className="settings-modal">
      <div className="settings-content">
        <h2>Settings</h2>

        <div className="setting-group">
          <label>Theme:</label>
          <select value={theme} onChange={e => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="cool">Cool</option>
          </select>
        </div>

        <div className="setting-group">
          <label>Sound:</label>
          <button onClick={() => setSoundOn(!soundOn)}>
            {soundOn ? "Turn Off" : "Turn On"}
          </button>
        </div>

        <div className="setting-group">
          <button onClick={resetScores}>Reset Leaderboard</button>
        </div>

        <button onClick={close}>Close</button>
      </div>
    </div>
  );
};

export default SettingsModal;
