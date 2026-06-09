import { Schedule } from '../main/schedule';
import { LandActivities9am, LandActivities10am, WaterActivities } from '../types/schedule-types';

// Get contents of textarea box
export const submitTextboxContent = () => {
  const txtBox = document.getElementById('paste-textarea') as HTMLInputElement;
  const txtBoxContent = txtBox.value;
  const reply = window.textAPI.send_text(txtBoxContent);
  reply
    .then((value): string[] => {
      console.log(value);
      return value;
    })
    .catch(error => {
      console.error('Promise rejected with:', error);
    });
};

// Send ipc message to main to open file picker
export const fileUpload = () => {
  const reply = window.textAPI.file_dialog();
  reply
    .then((value): string[] => {
      console.log(value);
      return value;
    })
    .catch(error => {
      console.error('Promise rejected with:', error);
    });
};

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

export const timeSlotData = (
  result: Schedule,
  activities: string[],
  title: string,
  timeSlot: string
) => {
  let timeSlotText = `${title}\n`;
  for (const activity of activities) {
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
    const activityName = activityKids ? activity : 'No activity scheduled';
    timeSlotText += `${activityName} ${activityKids.length}\n`;
    timeSlotText += `${joinNames(activityKids)}\n`;
    timeSlotText += '\n';
  }
  return timeSlotText;
};

export const copySchedule = (
  result: Schedule,
  waterActs: string[],
  land9amActs: string[],
  land10amActs: string[]
) => {
  const water9amText = timeSlotData(result, waterActs, 'WATER 9AM', 'water9am');
  const water10amText = timeSlotData(result, waterActs, 'WATER 10AM', 'water10am');
  const land9amText = timeSlotData(result, land9amActs, 'LAND 9AM', 'land9am');
  const land10amText = timeSlotData(result, land10amActs, 'LAND 10AM', 'land10am');
  const reply = window.textAPI.copy_schedule(
    water9amText + '\n' + water10amText + '\n' + land9amText + '\n' + land10amText
  );
  reply
    .then((value): string[] => {
      console.log(value);
      return value;
    })
    .catch(error => {
      console.error('Promise rejected with:', error);
    });
  // return water9amText;
};

export const exportToExcel = (
  result: Schedule,
  waterActs: string[],
  land9amActs: string[],
  land10amActs: string[]
) => {
  // const water9amText = timeSlotData(result, waterActs, 'WATER 9AM', 'water9am');
  // const water10amText = timeSlotData(result, waterActs, 'WATER 10AM', 'water10am');
  // const land9amText = timeSlotData(result, land9amActs, 'LAND 9AM', 'land9am');
  // const land10amText = timeSlotData(result, land10amActs, 'LAND 10AM', 'land10am');
  const reply = window.textAPI.export_excel(result, waterActs, land9amActs, land10amActs);
  reply
    .then((value): string[] => {
      console.log(value);
      return value;
    })
    .catch(error => {
      console.error('Promise rejected with:', error);
    });
  // return water9amText;
};
