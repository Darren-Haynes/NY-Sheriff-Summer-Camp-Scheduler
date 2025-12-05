import React, { useEffect, useState } from 'react';
import ErrorBox from './ErrorBox';
import InputOptions from './InputOptions';
import PasteBox from './PasteBox';

export default function MainContent() {
  const [showInputOptions, setShowInputOptions] = useState('input-box');
  const [errorContent, setErrorContent] = useState([]);

  useEffect(() => {
    // Recieve errorData from Main
    window.textAPI.send_error(errorData => {
      setShowInputOptions('error-box');
      setErrorContent(JSON.parse(errorData));
    });
  });

  // TODO: fix type error
  const handleToggle = box => {
    setShowInputOptions(box);
  };
  return (
    <main>
      <div className="bg-image">
        <div className="overlay">
          <div id="input-section">
            <div id="central-container">
              <InputOptions isVisible={showInputOptions} onToggle={handleToggle} />
              <PasteBox isVisible={showInputOptions} onToggle={handleToggle} />
              <ErrorBox
                isVisible={showInputOptions}
                onToggle={handleToggle}
                errors={errorContent}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
