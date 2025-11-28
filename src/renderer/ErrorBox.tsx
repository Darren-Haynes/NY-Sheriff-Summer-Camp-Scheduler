interface ToggleProps {
  isVisible: string;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
  errors: ErrorObjects[];
}

interface ErrorObjects {
  header: string;
  errorList: string[];
}

const errorBox: React.FC<ToggleProps> = ({ isVisible, onToggle, errors }) => {
  if (isVisible !== 'error-box') {
    return null;
  }
  errors.forEach(error => {
    console.log(error.errorList);
  });

  let allErrors = '';
  errors.forEach(error => {
    allErrors += `${error.header}:\n`;
    error.errorList.forEach(error => {
      allErrors += `  - ${error}\n`;
    });
  });

  return (
    <div id="error-box">
      <div id="error-box-btn">
        <h3 id="error-heading">Fix Data Errors:</h3>
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
      <div id="error-content">
        <textarea id="error-textarea" value={allErrors}></textarea>
      </div>
    </div>
  );
};

export default errorBox;
