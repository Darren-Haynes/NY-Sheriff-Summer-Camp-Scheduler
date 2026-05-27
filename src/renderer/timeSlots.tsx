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
    if (names.length === 0) {
      return 'No kids scheduled';
    }
    let nameOrder = '';
    names.forEach(name => {
      const [last, first] = name.split(/\s+/);
      const inOrder = `${first} ${last}, `;
      nameOrder += inOrder;
    });
    return nameOrder.slice(0, -2);
  };

  return (
    <>
      <h3 className="result-heading-sub">{heading}</h3>
      <ul>
        {activities.map((item, index) => (
          <li key={index}>
            {item} {result[timeSlot][item].length}
            <p>{joinNames(result[timeSlot][item])}</p>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TimeSlot;
