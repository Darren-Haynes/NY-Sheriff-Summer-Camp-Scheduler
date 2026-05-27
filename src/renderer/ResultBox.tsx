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

  const activityTimeSlots: string[] = ['water9am', 'water10am'];
  const waterActs: string[] = ['fish', 'pboard', 'snork', 'canoe', 'kayak', 'sail', 'swim'];
  const land9amActs: string[] = ['art', 'hike', 'bball', 'cheer', 'soc', 'vball', 'arch'];
  const land10amActs: string[] = ['fris', 'art', 'hike', 'pball', 'fball', 'lax', 'yoga', 'arch'];

  let waterText = '';
  activityTimeSlots.forEach(timeSlot => {
    waterText += `${timeSlot}:\n`;
    waterActs.forEach(activity => {
      const names = result[timeSlot][activity];
      waterText += `${activity}: \n`;
      if (names.length === 0) {
        waterText += `No kids scheduled\n\n`;
      } else {
        waterText += `${names.join(', ')}\n\n`;
      }
    });
  });

  let landText9am = '';
  landText9am += `Land 9am:\n`;
  land9amActs.forEach(activity => {
    const names = result['land9am'][activity];
    landText9am += `${activity}: \n`;
    if (names.length === 0) {
      landText9am += `No kids scheduled\n\n`;
    } else {
      landText9am += `${names.join(', ')}\n\n`;
    }
  });

  let landText10am = '';
  landText10am += `Land 10am:\n`;
  land10amActs.forEach(activity => {
    const names = result['land10am'][activity];
    landText10am += `${activity}: \n`;
    if (names.length === 0) {
      landText10am += `No kids scheduled\n\n`;
    } else {
      landText10am += `${names.join(', ')}\n\n`;
    }
  });

  const allText = waterText + landText9am + landText10am;
  return (
    <div id="result-box">
      <h2 id="result-heading">Camp Schedule:</h2>
      <h3 className="result-heading-sub">Water 9am</h3>
      <h3 className="result-heading-sub">Water 10am</h3>
      <h3 className="result-heading-sub">Land 9am</h3>
      <h3 className="result-heading-sub">Land 10am</h3>
      <div id="result-content">
        <div>{allText}</div>
      </div>
    </div>
  );
};

export default resultBox;
