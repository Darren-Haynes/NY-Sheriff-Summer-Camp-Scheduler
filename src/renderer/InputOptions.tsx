import CampSign from "../../assets/its-all-about-the-kids.png";

interface ToggleProps {
  isVisible: boolean;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
}

const InputOptions: React.FC<ToggleProps> = ({ isVisible, onToggle }) => {
  if (!isVisible) {
    return null;
  }
  return (
    <div id="input-options">
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

      <div id="camp-sign">
        <img width="400" alt="icon" src={CampSign} />
      </div>
    </div>
  );
};

export default InputOptions;
