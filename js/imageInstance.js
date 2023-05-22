const historyDom = document.getElementById('history');

class ImageInstance {
    hex;
    src;
    diff = [];
    dom;
    history;

    constructor(hex,history,defaultHex) {
        this.hex = hex;
        this.compareHex(hex,history ? history.defaultHex : defaultHex);
        this.build();

        if (history) {
            this.history = history;
            this.toDom();
        }

        if (history.active) {
            this.setContentToEditableDiv(contenteditableDiv);
        }
    }

    compareHex(hex,defaultHex) {
        if (hex && defaultHex) {
            const hexArray = hex.split('');
            const diff = hexArray.filter((byte,index) => {
                if (byte !== defaultHex[index]) {
                    this.diff.push({
                        data: byte,
                        index: Math.floor(index)
                    });
                }
            });
        } else {
            console.warn("Hex data not provided for comparing data of an ImageInstance");
        }
    }

    // Converts hex to imgUrl
    build() {
        if (this.hex) {
            const hexArray = this.hex.match(/.{1,2}/g);
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
            img.src = this.src;
            container.appendChild(img);

            img.addEventListener('click', () => {
                previousImage = this;
                this.setContentToEditableDiv(contenteditableDiv)
                imagePreview.src = this.src;
            });
            
            let elm = this;
            let btnDelete = document.createElement('button');
            btnDelete.classList.add('btn-delete');
            btnDelete.addEventListener('click', () => {
                const index = this.history.list.indexOf(elm);
                this.history.remove(index);
            });
            container.appendChild(btnDelete);

            let btnFavorite = document.createElement('button');
            btnFavorite.classList.add('btn-favorite');
            btnFavorite.addEventListener('click', () => {
                sessionDb.add(this);
            });
            container.appendChild(btnFavorite);

            this.dom = container;

            historyDom.appendChild(container);
        } else {
            console.warn("Source data not provided for the DomElement creation of the ImageInstance")
        }
    }

    // Appends the hex data to the content editable div
    setContentToEditableDiv(parent) {
        let arr = this.hex.split('');

        parent.innerHTML = this.hex;

        let highlight = document.createElement('div');
        highlight.classList.add('highlight');

        if (this.diff.length > 0) {
            let coords = [];
            for (let i of this.diff) {
                coords.push(i.index);
            }
            coords = coords.sort((a, b) => a - b);
            
            let oldIndex = 0;
            for (let i=0 ; i<coords.length ; i++) {
                let coord = coords[i];
                let count = coord-oldIndex
                if (count > 0) highlight.innerHTML += '&nbsp;'.repeat(count);
                oldIndex = coord+1;
                highlight.innerHTML += arr[coord];
            };
            highlight.innerHTML += '&nbsp;'.repeat(arr.length-oldIndex);
        }
        
        parent.appendChild(highlight);
    }
}

class sessionHistory {
    metatata;
    list = [];
    active;
    defaultHex;
    constructor(originalContent) {
        this.active = true;
        this.defaultHex = originalContent;

        document.addEventListener('keydown', (event) => {
            if (this.active) {
                if (event.ctrlKey && event.key === 'z') {
                    if (this.len() > 1) {
                        const prev = this.get(this.len() - 2);
                        previousImage = prev;
                        imagePreview.src = prev.src;
                        prev.setContentToEditableDiv(contenteditableDiv);
                        this.remove(this.len() - 1);
                    }
                }
            }
        });
    }

    add(hex) {
        const img = new ImageInstance(hex,this);
        this.list.push(img);
    }

    remove(index) {
        this.list[index].dom.remove();
        this.list.splice(index, 1);
    }

    get(index) {
        return this.list[index];
    }

    len() {
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

class sessionDatabase {
    list = [];
    highlights = [];
    constructor() {

    }

    add(instance) {
        this.list.push(instance);
    }

    remove(index) {
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
    }

    addHighlight(instance) {
        this.highlights.push(instance.diff);
    }

    export() {
        let data = [];
        for (let element of this.list) {
            data.push({
                hex: element.hex,
                diff: element.diff
            });
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "data.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

const sessionDb = new sessionDatabase();