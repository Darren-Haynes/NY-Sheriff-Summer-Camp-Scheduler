interface ToggleProps {
  isVisible: boolean;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
}

const PasteBox: React.FC<ToggleProps> = ({ isVisible, onToggle }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="input-box">
      <button type="button" id="upload-2" className="paste-box-btns">
        Upload
      </button>

      <button
        onClick={onToggle}
        type="button"
        id="close-btn"
        className="paste-box-btns"
      >
        Close
      </button>

      <textarea id="texty-boxy">Paste text here...</textarea>
    </div>
  );
};

export default PasteBox;
