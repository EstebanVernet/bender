const inputFile = document.getElementById('inputFile');
const imagePreview = document.getElementById('imagePreview');
const contenteditableDiv = document.getElementById('hexcontent');

var histories = [];
let currentHistory = 0;
let previousImage;

contenteditableDiv.addEventListener('selectstart', function (e) {
    e.preventDefault();
});

function getCurrentHistory() {
    return histories[currentHistory];
}

// Import image
inputFile.addEventListener('change', function(event) {

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
        // document.getElementById('hexcontent').innerHTML = hexString;
        let history = new sessionHistory(hexString);
        history.add(hexString);
        previousImage = history.list[0];

        histories.push(history);
        currentHistory = histories.length - 1;
    });
});

contenteditableDiv.addEventListener('keydown', updateCursorPosition);

let isProcessing = false;

function documentPositionComparator (a, b) {
    if (a === b) {
        return 0;
    }
    var position = a.compareDocumentPosition(b);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING || position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
        return -1;
    } else if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) {
        return 1;
    } else {
        return 0;
    }
}

function getCombinedFocusOffset() {
    const selection = window.getSelection();
    let combinedOffset = 0;
    let arr = Array.from(contenteditableDiv.childNodes);

    let found = false;
    Array.from(arr.sort(documentPositionComparator)).forEach((span) => {
        if (!found) {
            if (selection.containsNode(span, true)) {
                combinedOffset += selection.focusOffset;
                found = true;
            } else {
                combinedOffset += span.textContent.length;
            }
        }
    });
    return combinedOffset;
}

function updateCursorPosition(event) {

    const selection = window.getSelection();

    const cursorPosition = Math.floor((getCombinedFocusOffset()+1)*2/3);

    const key = event.key.toUpperCase();

    if (key.startsWith('ARROW')) {
        return;
    }

    event.preventDefault();

    if (/^[0-9A-F]$/.test(key) && cursorPosition != previousImage.hex.length) {

        if (isProcessing) {
            return;
        }

        if (getCurrentHistory().list.length > 0) {
            previousImage = getCurrentHistory().list[getCurrentHistory().list.length - 1];
        }
        setProcess(true);

        
        const currentValue = contenteditableDiv.innerText.toUpperCase().replace(/\s/g, '');
        let newValue;
        if (currentValue[cursorPosition]) {
          newValue = currentValue.slice(0, cursorPosition) + key + currentValue.slice(cursorPosition + 1);
        } else {
          newValue = currentValue + key;
        }
        // contenteditableDiv.innerText = newValue;
               
        const hexString = newValue.toUpperCase();

        imagePreview.src = buildImage(hexString);
        
        imagePreview.addEventListener('load', function(event) {
            imagePreview.removeEventListener('load', arguments.callee);
            if (isProcessing) {
                // console.log("Image loaded")
                window.setTimeout(function() {
                    verifyImage(true, hexString);
                    placeCursor(cursorPosition);
                }, 50);
            }
        });

        imagePreview.addEventListener('error', async () => {
            imagePreview.removeEventListener('error', arguments.callee);
            if (isProcessing) {
                setProcess(false);
                // console.warn("Error loading image")

                imagePreview.src = previousImage.src;
                // verifyImage(false);
                previousImage.setContentToEditableDiv(contenteditableDiv);
                placeCursor(cursorPosition);
            }
        });
    }
}

function placeCursor(cursorPosition) {
    // Update the cursor position to be after the inserted/replaced character
    // For each elements of the contenteditable div, counts its length and sum them until we reach the cursor position, then place the cursor at the remaining offset
    let offset = 0;
    let found = false;
    Array.from(contenteditableDiv.childNodes).forEach((span) => {
        if (!found) {
            if (offset + span.textContent.length >= cursorPosition) {
                const range = document.createRange();
                const sel = window.getSelection();
                // set start to node next to the span
                range.setStartAfter(span);
                
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                found = true;
            } else {
                offset += span.textContent.length;
            }
        }
    }
    );

}

function buildImage(hex) {
    const hexArray = hex.match(/.{1,2}/g);
    const byteArray = hexArray.map(byte => parseInt(byte, 16));
    const blob = new Blob([new Uint8Array(byteArray)], {type: 'image/png'});
    const url = URL.createObjectURL(blob);
    return url;
}

function verifyImage(allowHistory, hexString) {    
    if (imagePreview.offsetWidth < 100 || imagePreview.offsetHeight < 35) {
        previousImage.setContentToEditableDiv(contenteditableDiv);
    } else {
        if (allowHistory && isHistoryAutmoatic) {
            getCurrentHistory().add(hexString);
        } else {
            previousImage = new ImageInstance(hexString,false,getCurrentHistory().defaultHex);
            previousImage.setContentToEditableDiv(contenteditableDiv);
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
        // Stream.appendImage(imagePreview.src)
    }
}

// Allow horizontal scroll for #history

historyDom.addEventListener('wheel', function(event) {
    event.preventDefault();
    historyDom.scrollLeft += event.deltaY;
}
);