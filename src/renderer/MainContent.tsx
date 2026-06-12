import React, { useEffect, useState } from 'react';
import { Schedule } from '../main/schedule';
import { ErrorData } from '../types/dataInput-types';
import ErrorBox from './ErrorBox';
import InputOptions from './InputOptions';
import InputOptionsSchedule from './InputOptionsAndSchedule';
import PasteBox from './PasteBox';
import ResultBox from './ResultBox';
import NotificationBox from './Notification';

export default function MainContent() {
  const [showSign, setShowSign] = useState<boolean>(true);
  const [showInputOptions, setShowInputOptions] = useState<string>('input-box');
  const [errorContent, setErrorContent] = useState<ErrorData[]>([]);
  const [resultContent, setResultContent] = useState<Schedule | null>(null);
  const [showNotification, setNotificationContent] = useState<string>('no-box');

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
      setShowSign(false);
    });
  }, []);

  useEffect(() => {
    // Trigger Notification in Main
    window.textAPI.send_clipboard(box => {
      setNotificationContent(box);
    });
  }, []);

  const handleToggle = (box: string) => {
    console.log('Toggling to:', box); // Verify this prints
    setShowInputOptions(box);
  };

  return (
    <main>
      <div className="bg-image">
        <div className="overlay">
          <div id="input-section">
            <div id="central-container">
              {showSign && (
                <InputOptions
                  isVisible={showInputOptions}
                  onToggle={handleToggle}
                  signVisible={showSign}
                />
              )}
              {!showSign && (
                <InputOptionsSchedule isVisible={showInputOptions} onToggle={handleToggle} />
              )}
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
