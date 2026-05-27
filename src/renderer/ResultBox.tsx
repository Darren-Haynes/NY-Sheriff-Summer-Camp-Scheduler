import React from 'react';
import TimeSlot from './timeSlots';

interface ToggleProps {
  isVisible: string;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
  result: resultObjects[];
}

interface resultObjects {
  header: string;
  resultList: string[];
}

const ResultBox: React.FC<ToggleProps> = ({ isVisible, onToggle, result }) => {
  if (isVisible !== 'result-box') {
    return null;
  }

  const waterActs: string[] = ['fish', 'pboard', 'snork', 'canoe', 'kayak', 'sail', 'swim'];
  const land9amActs: string[] = ['art', 'hike', 'bball', 'cheer', 'soc', 'vball', 'arch'];
  const land10amActs: string[] = ['fris', 'art', 'hike', 'pball', 'fball', 'lax', 'yoga', 'arch'];

  return (
    <div id="result-box">
      <div id="text-box" className="fade-in-1-5s">
        <div id="result-textarea">
          <TimeSlot
            heading={'Water 9am'}
            timeSlot={'water9am'}
            activities={waterActs}
            result={result}
          />
          <TimeSlot
            heading={'Water 10am'}
            timeSlot={'water10am'}
            activities={waterActs}
            result={result}
          />
          <TimeSlot
            heading={'Land 9am'}
            timeSlot={'land9am'}
            activities={land9amActs}
            result={result}
          />
          <TimeSlot
            heading={'Land 10am'}
            timeSlot={'land10am'}
            activities={land10amActs}
            result={result}
          />
        </div>
      </div>

      <div id="result-box-btns-container">
        <h2 id="result-heading" className="fade-in-1-5s">
          Camp Schedule
        </h2>
        <div id="result-box-btns">
          <button
            onClick={() => onToggle('input-box')}
            type="button"
            id="close-btn"
            className="paste-box-btns fade-in-1s"
          >
            Close ❌
          </button>
          <button
            // onClick={fileUpload}
            type="button"
            id="upload-btn-2"
            className="paste-box-btns fade-in-3s"
          >
            Export 📤
          </button>
          <button
            // onClick={submitTextboxContent}
            type="button"
            id="submit-btn"
            className="paste-box-btns fade-in-5s"
          >
            Copy 📋
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultBox;
