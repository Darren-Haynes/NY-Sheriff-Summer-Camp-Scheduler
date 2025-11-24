interface ToggleProps {
  isVisible: string;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
}

const PasteBox: React.FC<ToggleProps> = ({ isVisible, onToggle }) => {
  if (isVisible !== 'error') {
    return null;
  }

  return (
    <div id="input-box">
      <div id="text-box-btns">
        <button
          // TODO: fix type error
          onClick={() => onToggle('upload')}
          type="button"
          id="close-btn"
          className="paste-box-btns fade-in-1s"
        >
          Close ❌
        </button>
      </div>
    </div>
  );
};

export default PasteBox;
