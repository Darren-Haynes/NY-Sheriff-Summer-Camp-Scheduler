import { Schedule } from '../main/schedule';

interface ScheduleDataProps {
  stats: boolean;
  result: Schedule;
  waterActs: string[];
  land9amActs: string[];
  land10amActs: string[];
}

const StatsData: React.FC<ScheduleDataProps> = ({
  stats,
  result,
  waterActs,
  land9amActs,
  land10amActs,
}) => {
  if (!stats) {
    return null;
  }

  const landChoices = ['First choice', 'Second choice', 'Third choice', 'No choice'];
  const waterChoices = ['First choice', 'Second choice', 'Third choice', 'No choice'];

  return (
    <div id="stats-text-box" className="fade-in-1-5s">
      <h3 className="result-heading-sub">Water Choices</h3>
      <ul>
        {result.waterPercentages.map((activity, index) => (
          <li key={index}>
            {waterChoices[index]}: {activity}%
          </li>
        ))}
      </ul>

      <h3 className="result-heading-sub">Land Choices</h3>
      <ul>
        {result.landPercentages.map((activity, index) => (
          <li key={index}>
            {landChoices[index]}: {activity}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatsData;
