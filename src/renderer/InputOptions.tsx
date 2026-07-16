import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { fileUpload } from './ipcFunctions';
import CampSign from '../../assets/its-all-about-the-kids.png';

interface ToggleProps {
  isVisible: string;
  onToggle: (box: string) => void;
  signVisible: boolean;
}

const InputOptions: React.FC<ToggleProps> = ({ isVisible, onToggle }) => {
  if (isVisible !== 'input-box') {
    return null;
  }

  const showCampSign = useMediaQuery({ query: '(min-height: 825px)' });
  const showAbove1000 = useMediaQuery({ query: '(min-height: 1001px)' });
  const showAbove1200 = useMediaQuery({ query: '(min-height: 1201px)' });

  const campSignStyles = {
    height: showCampSign ? '500px' : '300px',
    // FIX: Flipped order so the tallest screen threshold is evaluated first.
    // Explicit ternary format handles full compiler code branch metrics.
    marginTop: showAbove1200 ? '-200px' : showAbove1000 ? '-100px' : 0,
  };

  return (
    <div id="input-options" style={campSignStyles}>
      <p className="fade-in-05s">Upload a spreadsheet</p>

      <button onClick={fileUpload} type="button" id="upload-btn" className="fade-in-1s">
        Upload
      </button>
      <p className="fade-in-1-5s">Paste sheet content</p>
      <button
        onClick={() => onToggle('paste-box')}
        type="button"
        id="paste-btn"
        className="paste-btn-txt fade-in-2s"
      >
        Paste Sheet
      </button>

      {/* Explicit ternary ensures that Istanbul logs both branches perfectly */}
      {showCampSign ? (
        <div id="camp-sign" className="fade-in-3s">
          <img width="400" alt="icon" src={CampSign} />
        </div>
      ) : null}
    </div>
  );
};

export default InputOptions;
