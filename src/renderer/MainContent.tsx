import React, { useEffect, useState } from 'react';
import ErrorBox from './ErrorBox';
import InputOptions from './InputOptions';
import PasteBox from './PasteBox';
import ResultBox from './ResultBox';
import NotificationBox from './Notification';

export default function MainContent() {
  const [showInputOptions, setShowInputOptions] = useState('input-box');
  const [errorContent, setErrorContent] = useState([]);
  const [resultContent, setResultContent] = useState([]);
  const [showNotification, setNotificationContent] = useState('no-box');

  useEffect(() => {
    // Recieve errorData from Main
    window.textAPI.send_error(errorData => {
      setShowInputOptions('error-box');
      setErrorContent(JSON.parse(errorData));
    });
  }, []);

  useEffect(() => {
    // Recieve resultData from Main
    window.textAPI.send_result(resultData => {
      setShowInputOptions('result-box');
      setResultContent(JSON.parse(resultData));
    });
  }, []);

  useEffect(() => {
    // Recieve resultData from Main
    window.textAPI.send_clipboard(box => {
      setNotificationContent(box);
    });
  }, []);

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
              <ResultBox
                isVisible={showInputOptions}
                onToggle={handleToggle}
                result={resultContent}
              />
              <NotificationBox
                isVisible={showNotification}
                onToggle={handleToggle}
                message={'Copied to clipboard!'}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
