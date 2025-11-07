import React, { useState } from "react";
import InputOptions from "./InputOptions";
import PasteBox from "./PasteBox";

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
            <div id="central-container">
              <InputOptions
                isVisible={showInputOptions}
                onToggle={handleToggle}
              />
              <PasteBox isVisible={!showInputOptions} onToggle={handleToggle} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
