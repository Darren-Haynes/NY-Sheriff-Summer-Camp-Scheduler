import React, { useState } from 'react';
import { copySchedule, exportToExcel } from './ipcFunctions';
import { Schedule } from '../main/schedule';
import StatsData from './Stats';
import ScheduleData from './Schedule';

interface ToggleProps {
  isVisible: string;
  onToggle: (box: string) => void;
  result: Schedule | null;
}

const ResultBox: React.FC<ToggleProps> = ({ isVisible, onToggle, result }) => {
  if (isVisible !== 'result-box') {
    return null;
  }

  const waterActs: string[] = ['fish', 'pboard', 'snork', 'canoe', 'kayak', 'sail', 'swim'];
  const land9amActs: string[] = ['art', 'hike', 'bball', 'cheer', 'soc', 'vball', 'arch'];
  const land10amActs: string[] = ['fris', 'art', 'hike', 'pball', 'fball', 'lax', 'yoga', 'arch'];

  if (!result) {
    return null;
  }

  const [showStats, setShowStats] = useState<boolean>(false);
  const toggleData = () => {
    setShowStats(prevState => !prevState);
  };

  return (
    <div id="result-box">
      {!showStats && (
        <ScheduleData
          stats={false}
          result={result}
          waterActs={waterActs}
          land9amActs={land9amActs}
          land10amActs={land10amActs}
        />
      )}

      {showStats && (
        <StatsData
          stats={true}
          result={result}
          waterActs={waterActs}
          land9amActs={land9amActs}
          land10amActs={land10amActs}
        />
      )}

      <div id="result-box-btns-container">
        {/*<h2 id="result-heading" className="fade-in-1-5s">
          Camp Schedule
        </h2>*/}
        <div id="result-box-btns">
          {!showStats && (
            <button
              onClick={() => toggleData()}
              type="button"
              id="stats-btn"
              className="paste-box-btns fade-in-1s"
            >
              Stats 📈
            </button>
          )}
          {showStats && (
            <button
              onClick={() => toggleData()}
              type="button"
              id="kids-btn"
              className="paste-box-btns fade-in-1s"
            >
              Kids ⛵
            </button>
          )}

          <hr></hr>

          <button
            onClick={() => onToggle('input-box')}
            type="button"
            id="close-btn"
            className="paste-box-btns fade-in-1s"
          >
            Close ❌
          </button>
          <button
            onClick={() => exportToExcel(result, waterActs, land9amActs, land10amActs)}
            type="button"
            id="upload-btn-2"
            className="paste-box-btns fade-in-3s"
          >
            Export 📤
          </button>
          <button
            onClick={() => copySchedule(result, waterActs, land9amActs, land10amActs)}
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
