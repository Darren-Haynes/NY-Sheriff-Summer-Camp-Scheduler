import { useMediaQuery } from "react-responsive";
import CampSign from "../../assets/its-all-about-the-kids.png";

interface ToggleProps {
  isVisible: boolean;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
}

const InputOptions: React.FC<ToggleProps> = ({ isVisible, onToggle }) => {
  if (!isVisible) {
    return null;
  }

  const showCampSign = useMediaQuery({ query: "(min-height: 825px)" });
  const showAbove1000 = useMediaQuery({ query: "(min-height: 1001px)" });
  const showAbove1200 = useMediaQuery({ query: "(min-height: 1201px)" });

  const campSignStyles = {
    height: showCampSign ? "500px" : "300px",
    marginTop: showAbove1000 ? "-100px" : showAbove1200 ? "-200px" : 0,
  };

  return (
    <div id="input-options" style={campSignStyles}>
      <p className="fade-in-05s">Upload a spreadsheet</p>

      <button type="button" id="upload-btn" className="fade-in-1s">
        Upload
      </button>
      <p className="fade-in-1-5s">or paste sheet content</p>
      <button
        onClick={onToggle}
        type="button"
        id="paste-btn"
        className="paste-btn-txt fade-in-2s"
      >
        Paste Sheet
      </button>

      {showCampSign && (
        <div id="camp-sign" className="fade-in-3s">
          <img width="400" alt="icon" src={CampSign} />
        </div>
      )}
    </div>
  );
};

export default InputOptions;
