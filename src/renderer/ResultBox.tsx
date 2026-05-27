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
      <h2 id="result-heading">Camp Schedule:</h2>
      <TimeSlot
        heading={'Water 9am'}
        timeSlot={'water9am'}
        activities={waterActs}
        result={result}
      />
      ;
      <TimeSlot
        heading={'Water 10am'}
        timeSlot={'water10am'}
        activities={waterActs}
        result={result}
      />
      ;
      <TimeSlot
        heading={'Land 9am'}
        timeSlot={'land9am'}
        activities={land9amActs}
        result={result}
      />
      ;
      <TimeSlot
        heading={'Land 10am'}
        timeSlot={'land10am'}
        activities={land10amActs}
        result={result}
      />
      ;
    </div>
  );
};

export default ResultBox;
