interface ToggleProps {
  isVisible: string;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
  result: resultObjects[];
}

interface resultObjects {
  header: string;
  resultList: string[];
}

const resultBox: React.FC<ToggleProps> = ({ isVisible, onToggle, result }) => {
  if (isVisible !== 'result-box') {
    return null;
  }

  return <div id="result-box">Water 9am Schedule</div>;
};

export default resultBox;
