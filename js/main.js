const inputFile = document.getElementById('inputFile');
const imagePreview = document.getElementById('imagePreview');

const History = new history();
// const Stream = new stream();

// Import image
inputFile.addEventListener('change', function(event) {
    
    History.reset();

    const file = event.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.addEventListener('load', function(event) {
        imagePreview.src = event.target.result;
    });

    const readerHex = new FileReader();
    readerHex.readAsArrayBuffer(file);

    readerHex.addEventListener('load', function(event) {
        const buffer = event.target.result;
        const hexString = Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('').toUpperCase();
        document.getElementById('hexcontent').innerHTML = hexString;
        History.add(hexString);
    });
});

const contenteditableDiv = document.getElementById('hexcontent');
contenteditableDiv.addEventListener('keydown', updateCursorPosition);

let isProcessing = false;

let previousString = contenteditableDiv.innerText;

function updateCursorPosition(event) {

    const selection = window.getSelection();
    const cursorPosition = selection.focusOffset;
    const key = event.key.toUpperCase();    // if key are arrows, do nothing

    if (key.startsWith('ARROW')) {
        console.log('yee')
        return;
    }

    event.preventDefault();

    if (/^[0-9A-F]$/.test(key) && cursorPosition != contenteditableDiv.innerText.length) {

        if (isProcessing) {
            return;
        }

        previousString = contenteditableDiv.innerText;

        setProcess(true);
        
        const currentValue = contenteditableDiv.innerText.toUpperCase();
        let newValue;
        if (currentValue[cursorPosition]) {
          newValue = currentValue.slice(0, cursorPosition) + key + currentValue.slice(cursorPosition + 1);
        } else {
          newValue = currentValue + key;
        }
        contenteditableDiv.innerText = newValue;

        const hexString = newValue.toUpperCase();
        imagePreview.src = buildImage(hexString);

        imagePreview.addEventListener('load', function(event) {
            imagePreview.removeEventListener('load', arguments.callee);
            if (isProcessing) {
                window.setTimeout(function() {
                    verifyImage(true, hexString);
                    placeCursor(cursorPosition);
                }, 50);
            }
        });

        imagePreview.addEventListener('error', function(event) {
            imagePreview.removeEventListener('error', arguments.callee);
            if (isProcessing) {
                contenteditableDiv.innerText = previousString;
                imagePreview.src = buildImage(previousString);
                verifyImage(false);
                placeCursor(cursorPosition);
            }
        });
    }
}

function placeCursor(cursorPosition) {
    // Update the cursor position to be after the inserted/replaced character
    const newCursorPosition = cursorPosition + 1;
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(contenteditableDiv.firstChild, newCursorPosition);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
}

function buildImage(hex) {
    const hexArray = hex.match(/.{1,2}/g);
    const byteArray = hexArray.map(byte => parseInt(byte, 16));
    const blob = new Blob([new Uint8Array(byteArray)], {type: 'image/png'});
    const url = URL.createObjectURL(blob);
    return url;
}


function verifyImage(allowHistory, hexString) {
    // console.log(imagePreview.offsetWidth, imagePreview.offsetHeight)
    
    if (imagePreview.offsetWidth < 100 || imagePreview.offsetHeight < 35) {
        contenteditableDiv.innerText = previousString;
        imagePreview.src = buildImage(previousString);  
    } else {
        if (allowHistory && isHistoryAutmoatic) {
            History.add(hexString);
        }
    }
    setProcess(false);
}


function setProcess(bool) {
    isProcessing = bool;
    if (bool) {
        contenteditableDiv.classList.add('processing');
    } else {
        contenteditableDiv.classList.remove('processing');
        Stream.appendImage(imagePreview.src)
    }
}

// Allow horizontal scroll for #history

historyDom.addEventListener('wheel', function(event) {
    event.preventDefault();
    historyDom.scrollLeft += event.deltaY;
}
);