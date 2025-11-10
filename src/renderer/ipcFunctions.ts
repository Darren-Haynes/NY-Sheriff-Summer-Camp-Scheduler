// Get contents of textarea box
export const submitTextboxContent = () => {
    const txtBox = document.getElementById("textarea") as HTMLInputElement;
    const txtBoxContent = txtBox.value;
    const reply = window.textAPI.send_text(txtBoxContent);
    reply
        .then((value): null => {
            alert(value);
            return null;
        })
        .catch((error) => {
            // This callback executes if the promise is rejected
            console.error("Promise rejected with:", error);
        });
};

// Send ipc message to main to open file picker
export const fileUpload = () => {
    window.textAPI.file_dialog();
};
