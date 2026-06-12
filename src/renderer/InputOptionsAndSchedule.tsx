import { useMediaQuery } from 'react-responsive';
import { fileUpload } from './ipcFunctions';

interface ToggleProps {
  isVisible: string;
  onToggle: (box: string) => void;
}

const InputOptionsSchedule: React.FC<ToggleProps> = ({ isVisible, onToggle }) => {
  if (isVisible !== 'input-box') {
    return null;
  }

  const above825 = useMediaQuery({ query: '(min-height: 825px)' });
  const above1000 = useMediaQuery({ query: '(min-height: 1001px)' });
  const above1200 = useMediaQuery({ query: '(min-height: 1201px)' });

  const campSignStyles = {
    height: above825 ? '500px' : '300px',
    marginTop: above1000 ? '-100px' : above1200 ? '-200px' : 0,
  };

  const inputButtonStyles = {
    marginTop: '15px',
    marginBottom: '15px',
  };

  return (
    <div id="input-options" style={campSignStyles}>
      <p style={above825 ? {} : inputButtonStyles} className="fade-in-05s">
        Upload a spreadsheet
      </p>
      <button onClick={fileUpload} type="button" id="upload-btn" className="fade-in-1s">
        Upload
      </button>

      <p style={above825 ? {} : inputButtonStyles} className="fade-in-1-5s">
        Paste sheet content
      </p>
      <button
        onClick={() => onToggle('paste-box')}
        // style={above825 ? {} : inputButtonStyles}
        type="button"
        id="paste-btn"
        className="paste-btn-txt fade-in-2s"
      >
        Paste Sheet
      </button>

      {above825 && <hr id="inputbox-hr" className="fade-in-1s"></hr>}
      <p style={above825 ? {} : inputButtonStyles} id="view-schedule-p" className="fade-in-1-5s">
        View previous schedule data
      </p>

      <button
        onClick={() => onToggle('result-box')}
        style={above825 ? {} : { marginTop: '1px' }}
        type="button"
        id="view-schedule-btn"
        className="fade-in-1s"
      >
        View
      </button>
    </div>
  );
};

export default InputOptionsSchedule;
