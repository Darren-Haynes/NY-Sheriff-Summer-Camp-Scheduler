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
      <div id="text-box" className="fade-in-1s">
        <textarea>Paste text here...</textarea>
      </div>

      <div id="text-box-btns">
        <button
          onClick={onToggle}
          type="button"
          id="close-btn"
          className="paste-box-btns fade-in-1s"
        >
          Close ❌
        </button>
        <button
          type="button"
          id="upload-btn-2"
          className="paste-box-btns fade-in-3s"
        >
          Upload 📤
        </button>
        <button
          type="button"
          id="submit-btn"
          className="paste-box-btns fade-in-5s"
        >
          Submit ✅
        </button>
      </div>
    </div>
  );
};

export default PasteBox;
