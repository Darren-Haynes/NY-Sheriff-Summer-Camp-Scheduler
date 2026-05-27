import { Schedule } from '../main/schedule';

const TimeSlot = ({
  heading,
  timeSlot,
  activities,
  result,
}: {
  heading: string;
  timeSlot: string;
  activities: string[];
  result: typeof Schedule;
}) => {
  const joinNames = (names: string[]): string => {
    return names.length === 0 ? 'No kids scheduled' : names.join(', ');
  };

  return (
    <>
      <h3 className="result-heading-sub">{heading}</h3>
      <ul>
        {activities.map((item, index) => (
          <li key={index}>
            {item}
            <p>{joinNames(result[timeSlot][item])}</p>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TimeSlot;
