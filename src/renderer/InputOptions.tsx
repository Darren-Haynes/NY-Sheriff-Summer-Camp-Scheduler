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
  const showOnLargeScreen = useMediaQuery({ query: "(min-height: 1200px)" });

  const campSignStyles = {
    height: showCampSign ? "500px" : "300px",
    marginTop: showOnLargeScreen
      ? "calc((100vh - 1100px) / 2)"
      : showCampSign
        ? "calc((100vh - 790px) / 2)"
        : "calc(((100vh - 267px) - 310px) / 2)",
  };

  return (
    <div id="input-options" style={campSignStyles}>
      <p>Upload a spreadsheet</p>

      <button type="button" id="upload-btn" className="btn-margin">
        Upload
      </button>
      <p>or paste sheet content</p>
      <button
        onClick={onToggle}
        type="button"
        id="paste-btn"
        className="paste-btn-txt btn-margin"
      >
        Paste Sheet
      </button>

      {showCampSign && (
        <div id="camp-sign">
          <img width="400" alt="icon" src={CampSign} />
        </div>
      )}
    </div>
  );
};

export default InputOptions;
