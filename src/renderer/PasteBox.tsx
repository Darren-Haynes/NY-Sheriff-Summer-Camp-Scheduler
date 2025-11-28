import { submitTextboxContent, fileUpload } from './ipcFunctions';

interface ToggleProps {
  isVisible: string;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
}

const PasteBox: React.FC<ToggleProps> = ({ isVisible, onToggle }) => {
  if (isVisible !== 'paste-box') {
    return null;
  }

  return (
    <div id="input-box">
      <div id="text-box" className="fade-in-1s">
        <textarea id="paste-textarea">Paste text here...</textarea>
      </div>

      <div id="text-box-btns">
        <button
          onClick={() => onToggle('input-options')}
          type="button"
          id="close-btn"
          className="paste-box-btns fade-in-1s"
        >
          Close ❌
        </button>
        <button
          onClick={fileUpload}
          type="button"
          id="upload-btn-2"
          className="paste-box-btns fade-in-3s"
        >
          Upload 📤
        </button>
        <button
          onClick={submitTextboxContent}
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
