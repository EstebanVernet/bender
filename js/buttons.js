const saveButton = document.getElementById('saveImage'),
resetHistoryButton = document.getElementById('resetHistory'),
resetImageButton = document.getElementById('resetImage'),
toggleHistoryButton = document.getElementById('toggleHistory'),
undoButton = document.getElementById('undo'),
addImageToHistoryButton = document.getElementById('addImageToHistory');

saveButton.addEventListener('click', function(event) {
    // get data from imagePreview, draws it on a canvas, and saves it as a png
    const canvas = document.createElement('canvas');
    canvas.width = imagePreview.naturalWidth;
    canvas.height = imagePreview.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imagePreview, 0, 0);
    const data = canvas.toDataURL('image/png');

    const downloadLink = document.createElement('a');
    downloadLink.href = data;
    downloadLink.download = 'image.png';
    downloadLink.click();
});

resetHistoryButton.addEventListener('click', function(event) {
    Toast.show('Are you sure you want to reset the session?', {
        text: 'Yes',
        callback: () => {
            getCurrentHistory().reset();
        }
    }, {
        text: 'No',
        callback: () => {
        }
    });
});

resetImageButton.addEventListener('click', function(event) {
    let defaultImage = getCurrentHistory().list[0];
    imagePreview.src = defaultImage.src; 
    defaultImage.setContentToEditableDiv(contenteditableDiv);
});

let isHistoryAutmoatic = true;
toggleHistoryButton.addEventListener('click', function(event) {
    isHistoryAutmoatic = !isHistoryAutmoatic;
    document.getElementById("toggleImg").src = isHistoryAutmoatic ? 'img/tno.png' : 'img/tyes.png';
    if (isHistoryAutmoatic) {
        addImageToHistoryButton.style.display = 'none';
    } else {
        addImageToHistoryButton.style.display = 'block';
    }
});

addImageToHistoryButton.addEventListener('click', function(event) {
    const hex = contenteditableDiv.innerText.toUpperCase().replace(/\s/g, '');
    getCurrentHistory().add(hex);
});

undoButton.addEventListener('click', function(event) {
    let hist = getCurrentHistory()
    if (hist.len() > 1) {
        const prev = hist.get(hist.len() - 2);
        previousImage = prev;
        imagePreview.src = prev.src;
        prev.setContentToEditableDiv(contenteditableDiv);
        hist.remove(hist.len() - 1);
    }
});