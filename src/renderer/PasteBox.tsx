interface ToggleProps {
  isVisible: boolean;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
}

const PasteBox: React.FC<ToggleProps> = ({ isVisible, onToggle }) => {
  if (!isVisible) {
    return null;
  }

  const submitTextboxContent = () => {
    const txtBox = document.getElementById("textarea") as HTMLInputElement;
    const txtBoxContent = txtBox.value;
    const reply = window.textAPI.send_text(txtBoxContent);
    reply
      .then((value): null => {
        alert(value);
        return null;
      })
      .catch((error) => {
        // This callback executes if the promise is rejected
        console.error("Promise rejected with:", error);
      });
  };

  // Send ipc message to main to open file picker
  const fileUpload = () => {
    window.textAPI.file_dialog();
  };

  return (
    <div id="input-box">
      <div id="text-box" className="fade-in-1s">
        <textarea id="textarea">Paste text here...</textarea>
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
