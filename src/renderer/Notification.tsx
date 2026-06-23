import React, { useEffect } from 'react';

interface ToggleProps {
  isVisible: string;
  onToggle: (box: string) => void;
  message: string;
}

const NotificationBox: React.FC<ToggleProps> = ({ isVisible, onToggle, message }) => {
  useEffect(() => {
    // If the box is shown, start a timer matching your 5s CSS animation
    if (isVisible === 'notification-box') {
      const timer = setTimeout(() => {
        onToggle('no-box'); // Safely resets the state back to 'no-box' in MainContent.tsx
      }, 5000);

      return () => clearTimeout(timer); // Clean up timer if component unmounts early
    }
  }, [isVisible, onToggle]);

  if (isVisible !== 'notification-box') {
    return null;
  }

  return (
    <div id="notification-box" className="fade-out-5s-stay">
      <p>{message}</p>
    </div>
  );
};

export default NotificationBox;
