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

export const timeSlotData = (result, activities: string[], title: string, timeSlot: string) => {
  let timeSlotText = `${title}\n`;
  for (const activity of activities) {
    timeSlotText += `${activity} ${result[timeSlot][activity].length}\n`;
    timeSlotText += `${joinNames(result[timeSlot][activity])}\n`;
    timeSlotText += '\n';
  }
  return timeSlotText;
};

export const copySchedule = (
  result,
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
