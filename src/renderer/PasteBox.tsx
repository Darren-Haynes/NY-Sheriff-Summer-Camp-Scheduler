interface ToggleProps {
  isVisible: boolean;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
}

const PasteBox: React.FC<ToggleProps> = ({ isVisible, onToggle }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div id="input-box">
      <div id="text-box">
        <textarea>Paste text here...</textarea>
      </div>

      <div id="text-box-btns">
        <button
          onClick={onToggle}
          type="button"
          id="close-btn"
          className="paste-box-btns"
        >
          Close ❌
        </button>
        <button type="button" id="upload-btn-2" className="paste-box-btns">
          Upload 📤
        </button>
        <button type="button" id="submit-btn" className="paste-box-btns">
          Submit ✅
        </button>
      </div>
    </div>
  );
};

export default PasteBox;
