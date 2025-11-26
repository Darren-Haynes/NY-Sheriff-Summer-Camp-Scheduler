interface ToggleProps {
  isVisible: string;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
}

const errorBox: React.FC<ToggleProps> = ({ isVisible, onToggle }) => {
  if (isVisible !== 'error-box') {
    return null;
  }

  return (
    <div id="error-box">
      <div id="error-box-btn">
        <h3>Fix Data Errors:</h3>
        <button
          // TODO: fix type error
          onClick={() => onToggle('input-box')}
          type="button"
          id="close-btn-error"
          className="paste-box-btns fade-in-1s"
        >
          ❌
        </button>
      </div>
    </div>
  );
};

export default errorBox;
