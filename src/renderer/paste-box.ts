function sleep(ms: number): Promise<string> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function toggleTxtBox(): void {
    const textArea = document.getElementById('texty-boxy');
    if (textArea) {
        textArea.remove()
    } else {
        const textArea = document.createElement('textarea');
        textArea.textContent = 'Paste text here...';
        textArea.setAttribute('id', 'texty-boxy');
        const inputSection = document.getElementById('input-box');
        inputSection.style.height = '60%'
        inputSection.style.marginBottom = '90px'
        inputSection.appendChild(textArea);
    }
}

function getHTMLElements(): (HTMLElement)[] {
    // function getHTMLElements(): (HTMLElement | NodeListOf<HTMLParagraphElement>)[] {
    const inputBtns = document.getElementById('input-box');
    const uploadBtn = document.getElementById('upload-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const closeBtn = document.getElementById('close-btn');
    const campSign = document.getElementById('camp-sign');
    return [inputBtns, uploadBtn, pasteBtn, closeBtn, campSign]
}

function getHTMLParagraphElements(): NodeListOf<HTMLParagraphElement> {
    const inputBtns = document.getElementById('input-box');
    const paragraphs = inputBtns.querySelectorAll('p');
    return paragraphs
}

function addClasses(elems: (HTMLElement[] | NodeListOf<HTMLParagraphElement>), classes: string[]): void {
    elems.forEach(elem => {
        classes.forEach(theClass => {
            elem.classList.add(theClass);
        });
    });
}

function removeClasses(elems: (HTMLElement[] | NodeListOf<HTMLParagraphElement>), classes: string[]): void {
    elems.forEach(elem => {
        classes.forEach(theClass => {
            elem.classList.remove(theClass);
        });
    });
}

function updateDisplay(elems: (HTMLElement[] | NodeListOf<HTMLParagraphElement>), classes: string[]): void {
    let i = 0;
    elems.forEach(elem => {
        elem.style.display = classes[i]
        i++
    })
}

function sleepAndUpdateBtns(uploadBtn: HTMLElement, closeBtn: HTMLElement, pasteBtn: HTMLElement): void {
    sleep(2500).then(() => {
        removeClasses([uploadBtn, closeBtn, pasteBtn], ['fade-in', 'fade-out']);
        uploadBtn.style.opacity = '1';
        closeBtn.style.opacity = '1';
    })
}

export const closeTxtBox = (): void => {
    const [inputBtns, uploadBtn, pasteBtn, closeBtn, campSign] = getHTMLElements()
    const paragraphs = getHTMLParagraphElements()
    updateDisplay([campSign], ['block'])
    inputBtns.classList.toggle('paste-box');
    inputBtns.style.width = '500px';
    inputBtns.style.height = '300px';
    addClasses([uploadBtn, closeBtn, pasteBtn], ['fade-in', 'fade-out']);
    removeClasses([uploadBtn, pasteBtn], ['btn-margin-after']);
    removeClasses(paragraphs, ['fade-out']);
    toggleTxtBox()
    updateDisplay(paragraphs, ['block', 'block'])
    updateDisplay([pasteBtn, closeBtn], ['inline-block', 'none'])
    sleepAndUpdateBtns(uploadBtn, closeBtn, pasteBtn)
}

export const openTxtBox = (): void => {
    const [inputBtns, uploadBtn, pasteBtn, closeBtn, campSign] = getHTMLElements()
    const paragraphs = getHTMLParagraphElements()
    updateDisplay([campSign], ['none'])
    inputBtns.classList.toggle('paste-box');
    inputBtns.style.width = '50%';
    inputBtns.style.height = '500px';
    addClasses([uploadBtn, closeBtn, pasteBtn], ['fade-out']);
    addClasses([uploadBtn, pasteBtn], ['btn-margin-after']);
    addClasses([closeBtn], ['close-btn-margin-after']);
    addClasses(paragraphs, ['fade-out']);
    sleep(500).then(() => {
        updateDisplay(paragraphs, ['none', 'none'])
        updateDisplay([pasteBtn, closeBtn], ['none', 'inline-block'])
        addClasses([uploadBtn, closeBtn], ['fade-in']);
        toggleTxtBox()
        const textarea = document.getElementById('texty-boxy');
        textarea.classList.toggle('fade-in-50');
    })
    sleepAndUpdateBtns(uploadBtn, closeBtn, pasteBtn)
}