import React, { useEffect, useState, useCallback, memo } from 'react';
import { Schedule } from '../main/schedule';
import { ErrorData } from '../types/dataInput-types';
import ErrorBox from './ErrorBox';
import InputOptions from './InputOptions';
import InputOptionsSchedule from './InputOptionsAndSchedule';
import PasteBox from './PasteBox';
import ResultBox from './ResultBox';
import NotificationBox from './Notification';
import imageUrls from './imageUrls';

// 1. Isolate the style-updating block into an independent sub-component
const BackgroundCanvas = memo(({ currentBgImage }: { currentBgImage: number }) => {
  const isEven = currentBgImage % 2 === 0;

  const customStyles = {
    '--bg-a': isEven
      ? imageUrls[currentBgImage]
      : imageUrls[(currentBgImage - 1 + imageUrls.length) % imageUrls.length],
    '--bg-b': !isEven
      ? imageUrls[currentBgImage]
      : imageUrls[(currentBgImage - 1 + imageUrls.length) % imageUrls.length],
  } as React.CSSProperties;

  return (
    <div
      className={`bg-canvas-layer ${isEven ? 'show-layer-a' : 'show-layer-b'}`}
      style={customStyles}
    />
  );
});

export default function MainContent() {
  const [showSign, setShowSign] = useState<boolean>(true);
  const [showInputOptions, setShowInputOptions] = useState<string>('input-box');
  const [showNotification, setNotificationContent] = useState<string>('no-box');
  const [notificationKey, setNotificationKey] = useState<number>(0);
  const [errorContent, setErrorContent] = useState<ErrorData[]>([]);
  const [resultContent, setResultContent] = useState<Schedule | null>(null);
  const [currentBgImage, setCurrentBgImage] = useState<number>(0);

  useEffect(() => {
    window.textAPI.send_error(errorData => {
      setShowInputOptions('error-box');
      setErrorContent(JSON.parse(errorData));
    });
  }, []);

  useEffect(() => {
    window.textAPI.send_no_paste_content(noPasteData => {
      setShowInputOptions('paste-box');
    });
  }, []);

  useEffect(() => {
    window.textAPI.send_result(resultData => {
      setShowInputOptions('result-box');
      setResultContent(JSON.parse(resultData));
      setShowSign(false);
    });
  }, []);

  useEffect(() => {
    window.textAPI.send_clipboard(box => {
      setNotificationContent(box);
    });
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentBgImage(prev => (prev + 1) % imageUrls.length);
    }, 12000); // 1 minute interval
    return () => clearInterval(intervalId);
  }, []);

  const handleToggle = useCallback((box: string) => {
    setShowInputOptions(box);
  }, []);

  const handleNotificationToggle = (box: string) => {
    setNotificationContent(box);
  };

  useEffect(() => {
    const unsubscribe = window.textAPI.send_clipboard(box => {
      setNotificationContent(box);
      setNotificationKey(prev => prev + 1); // Forces a fresh React key on every click
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="bg-image">
      {/* 2. Background Canvas floats isolated underneath everything inside the layout frame */}
      <BackgroundCanvas currentBgImage={currentBgImage} />

      <div className="overlay">
        <div id="input-section">
          <div id="central-container">
            {showSign ? (
              <InputOptions
                isVisible={showInputOptions}
                onToggle={handleToggle}
                signVisible={showSign}
              />
            ) : (
              <InputOptionsSchedule isVisible={showInputOptions} onToggle={handleToggle} />
            )}

            <PasteBox isVisible={showInputOptions} onToggle={handleToggle} />

            <ErrorBox isVisible={showInputOptions} onToggle={handleToggle} errors={errorContent} />

            <ResultBox
              isVisible={showInputOptions}
              onToggle={handleToggle}
              result={resultContent}
            />
            <NotificationBox
              key={notificationKey} // React will destroy and recreate the component when this changes
              isVisible={showNotification}
              onToggle={handleNotificationToggle}
              message={'Copied to clipboard!'}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
