interface ToggleProps {
  isVisible: string;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
  results: resultsObjects[];
}

interface resultsObjects {
  header: string;
  resultsList: string[];
}

const resultsBox: React.FC<ToggleProps> = ({ isVisible, onToggle, results }) => {
  if (isVisible !== 'results-box') {
    return null;
  }

  return <div id="results-box">Water 9am Schedule</div>;
};

export default resultsBox;
