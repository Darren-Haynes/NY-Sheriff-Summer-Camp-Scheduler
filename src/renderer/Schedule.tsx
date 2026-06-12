import TimeSlot from './timeSlots';
import { Schedule } from '../main/schedule';

interface ScheduleDataProps {
  stats: boolean;
  result: Schedule;
  waterActs: string[];
  land9amActs: string[];
  land10amActs: string[];
}

const ScheduleData: React.FC<ScheduleDataProps> = ({
  stats,
  result,
  waterActs,
  land9amActs,
  land10amActs,
}) => {
  if (stats) {
    return null;
  }

  return (
    <div id="text-box" className="fade-in-1-5s">
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
  );
};

export default ScheduleData;
