import { useMediaQuery } from 'react-responsive';
import { fileUpload } from './ipcFunctions';
import CampSign from '../../assets/its-all-about-the-kids.png';

interface ToggleProps {
  isVisible: string;
  onToggle: (box: string) => void;
  signVisible: boolean;
}

const InputOptions: React.FC<ToggleProps> = ({ isVisible, onToggle, signVisible }) => {
  if (isVisible !== 'input-box') {
    return null;
  }

  const showCampSign = useMediaQuery({ query: '(min-height: 825px)' });
  const showAbove1000 = useMediaQuery({ query: '(min-height: 1001px)' });
  const showAbove1200 = useMediaQuery({ query: '(min-height: 1201px)' });

  const campSignStyles = {
    height: showCampSign ? '500px' : '300px',
    marginTop: showAbove1000 ? '-100px' : showAbove1200 ? '-200px' : 0,
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

      {!signVisible && (
        <>
          <hr id="inputbox-hr" className="fade-in-1s"></hr>
          <p id="view-schedule-p" className="fade-in-1-5s">
            View previous schedule data
          </p>
          <button onClick={fileUpload} type="button" id="view-schedule-btn" className="fade-in-1s">
            View
          </button>
        </>
      )}

      {showCampSign && signVisible && (
        <div id="camp-sign" className="fade-in-3s">
          <img width="400" alt="icon" src={CampSign} />
        </div>
      )}
    </div>
  );
};

export default InputOptions;
