interface ToggleProps {
  isVisible: boolean;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
}

const PasteBox: React.FC<ToggleProps> = ({ isVisible, onToggle }) => {
  if (!isVisible) {
    return null;
  }
  return (
    <div id="texty-boxy">
      <button
        onClick={onToggle}
        type="button"
        id="close-btn"
        className="btn-margin"
      >
        Close
      </button>
    </div>
  );
};

export default PasteBox;
