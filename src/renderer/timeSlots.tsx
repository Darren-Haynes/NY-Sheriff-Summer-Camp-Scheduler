import { Schedule } from '../main/schedule';
import { LandActivities9am, LandActivities10am, WaterActivities } from '../types/schedule-types';

interface TimeSlotData {
  heading: string;
  timeSlot: string;
  activities: string[];
  result: Schedule;
}

const TimeSlot: React.FC<TimeSlotData> = ({ heading, timeSlot, activities, result }) => {
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

  const getItem = (timeSlot: string, activity: string): string[] => {
    let activityKids: string[] = [];
    switch (timeSlot) {
      case 'water9am':
        activityKids = result['water9am'][activity as WaterActivities];
        break;
      case 'water10am':
        activityKids = result['water10am'][activity as WaterActivities];
        break;
      case 'land9am':
        activityKids = result['land9am'][activity as LandActivities9am];
        break;
      case 'land10am':
        activityKids = result['land10am'][activity as LandActivities10am];
        break;
    }
    return activityKids;
  };
  return (
    <>
      <h3 className="result-heading-sub">{heading}</h3>
      <ul>
        {activities.map((activity, index) => (
          <li key={index}>
            {/*{activity} {result[timeSlot][activity].length}*/}
            {activity} {getItem(timeSlot, activity).length}
            <p>{joinNames(getItem(timeSlot, activity))}</p>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TimeSlot;
