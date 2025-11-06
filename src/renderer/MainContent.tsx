import React, { useState } from "react";
import CampSign from "../../assets/its-all-about-the-kids.png";

interface ToggleProps {
  isVisible: boolean;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
}

export default function MainContent() {
  const [showInputOptions, setShowInputOptions] = useState(true);

  const handleToggle = () => {
    setShowInputOptions((prev) => !prev);
  };

  return (
    <main>
      <div className="bg-image">
        <div className="overlay">
          <div id="input-section">
            <InputOptions
              isVisible={showInputOptions}
              onToggle={handleToggle}
            />
            <PasteBox isVisible={!showInputOptions} onToggle={handleToggle} />
          </div>
        </div>
      </div>
    </main>
  );
}

const InputOptions: React.FC<ToggleProps> = ({ isVisible, onToggle }) => {
  if (!isVisible) {
    return null;
  }
  return (
    <div id="input-options">
      <p>Upload a spreadsheet</p>

      <button type="button" id="upload-btn" className="btn-margin">
        Upload
      </button>
      <p>or paste sheet content</p>
      <button
        onClick={onToggle}
        type="button"
        id="paste-btn"
        className="paste-btn-txt btn-margin"
      >
        Paste Sheet
      </button>

      <div id="camp-sign">
        <img width="400" alt="icon" src={CampSign} />
      </div>
    </div>
  );
};

const PasteBox: React.FC<ToggleProps> = ({ isVisible, onToggle }) => {
  if (!isVisible) {
    return null;
  }
  return (
    <div id="texty-boxy">
      <button
        onClick={onToggle}
        type="button"
        id="close-btn"
        className="btn-margin"
      >
        Close
      </button>
    </div>
  );
};
