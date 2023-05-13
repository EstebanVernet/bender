const saveButton = document.getElementById('saveImage'),
resetHistoryButton = document.getElementById('resetHistory'),
toggleHistoryButton = document.getElementById('toggleHistory'),
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
    getCurrentHistory().reset();
});

let isHistoryAutmoatic = true;
toggleHistoryButton.addEventListener('click', function(event) {
    isHistoryAutmoatic = !isHistoryAutmoatic;
    document.getElementById("toggleText").innerText = isHistoryAutmoatic ? 'Enable manual history' : 'Disable manual history';
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