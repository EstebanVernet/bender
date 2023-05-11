const historyDom = document.getElementById('history');

class ImageInstance {
    hex;
    src;
    diff;
    dom;
    history;

    constructor(hex,defaultHex,history) {
        this.hex = hex;
        this.history = history;
        this.compareHex(hex,defaultHex);
        this.build();
        this.toDom();
        if (history.active) {
            this.setContentToEditableDiv(historyDom);
        }
    }

    compareHex(hex,defaultHex) {
        if (hex && defaultHex) {
            const hexArray = hex.match(/.{1,2}/g);
            const defaultHexArray = defaultHex.match(/.{1,2}/g);
            const diff = hexArray.filter((byte,index) => {
                if (byte !== defaultHexArray[index]) {
                    return {
                        data: byte,
                        index: index
                    }
                }
            });

            this.diff = diff;
        } else {
            console.warn("Hex data not provided for comparing data of an ImageInstance");
        }
    }

    // Converts hex to imgUrl
    build() {
        if (this.hex) {
            const hexArray = hex.match(/.{1,2}/g);
            const byteArray = hexArray.map(byte => parseInt(byte, 16));
            const blob = new Blob([new Uint8Array(byteArray)], {type: 'image/png'});
            const url = URL.createObjectURL(blob);
            this.src = url;
        } else {
            console.warn("Hex data not provided for building an ImageInstance")
        }
    }

    // Create a dom Element from provided data
    toDom() {
        if (this.src) {
            let container = document.createElement('div');
            container.classList.add('history-image-container');

            let img = document.createElement('img');
            this.hexdata = hex;
            img.src = this.src;
            container.appendChild(img);

            img.addEventListener('click', function(event) {
                previousString = hex;
                contenteditableDiv.innerText = hex;
                imagePreview.src = this.src;
            });
            
            let elm = this;
            let button = document.createElement('button');
            button.addEventListener('click', function(event) {
                console.log("ayo")
                const index = History.list.indexOf(elm);
                History.remove(index);
            });
            container.appendChild(button);

            this.dom = container;
        } else {
            console.warn("Source data not provided for the DomElement creation of the ImageInstance")
        }
    }

    // Appends the hex data to the content editable div
    setContentToEditableDiv(parent) {
        parent.innerHTML = "";
        const hexArray = hex.match(/.{1,2}/g);
        for (let i=0; i<hexArray.length; i++) {
            let byte = hexArray[i];
            let span = document.createElement('span');
            span.innerText = byte;
            parent.appendChild(span);
            for (let d of this.diff) {
                if (d.index === i) {
                    span.classList.add('diff');
                }
            }
        }
    }
}

class sessionHistory {
    metatata;
    list = [];
    active;
    constructor() {
        this.active = true;

        document.addEventListener('keydown', function(event) {
            if (active) {
                if (event.ctrlKey && event.key === 'z') {
                    if (this.length > 0) {
                        const last = this.get(this.length - 2);
                        previousString = last.hexdata;
                        contenteditableDiv.innerText = last.hexdata;
                        imagePreview.src = last.domElement.firstChild.src;
                        this.remove(this.length - 1);
                    }
                }
            }
        });
    }

    add(hex) {
        const img = new historyImage(hex);
        this.list.push(img);
    }

    remove(index) {
        this.list[index].domElement.remove();
        this.list.splice(index, 1);
    }

    get(index) {
        return this.list[index];
    }

    length() {
        return this.list.length;
    }

    reset() {
        this.list = [];
        historyDom.innerHTML = '';
    }

    open() {
        this.active = true;
        for (let img of this.list) {
            historyDom.appendChild(img.domElement);
        }
    }

    close() {
        this.active = false;
        historyDom.innerHTML = '';
    }
}