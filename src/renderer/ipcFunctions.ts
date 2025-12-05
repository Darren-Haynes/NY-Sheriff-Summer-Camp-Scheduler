import { netLog } from 'electron/main';

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
