const historyDom = document.getElementById('history');

class ImageInstance {
    hex;
    src;
    diff = [];
    dom;
    buttons;
    history;
    favorited;

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
            for (let i=0 ; i<hexArray.length ; i++) {
                if (hexArray[i] != defaultHex[i]) {
                    this.diff.push({
                        data: hexArray[i],
                        index: i
                    });
                }
            }
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
            
            /*
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
            */

            this.buttons = document.createElement('div');
            this.buttons.classList.add('buttons');
            container.appendChild(this.buttons);
            this.dom = container;

            this.addButton('delete', (btn) => {
                if (this.favorited) {
                    sessionDb.remove(this);
                }
                const index = this.history.list.indexOf(this);
                this.history.remove(index);
            });

            this.addButton('fav0', (btn) => {
                this.favorited = !this.favorited;
                if (this.favorited) {
                    sessionDb.remove(this);
                    btn.getElementsByTagName('img')[0].src = 'img/icons/fav1.png';
                } else {
                    sessionDb.add(this);
                    btn.getElementsByTagName('img')[0].src = 'img/icons/fav0.png';
                }
            });

            this.addButton('target', (btn) => {
                this.history.targetDiff = this.diff;
                // Get the current selected image
                previousImage.setContentToEditableDiv(contenteditableDiv);

                Toast.show('Data targeted. Do you also want to set your current data to the original image ?', {
                    text: 'Yes',
                    callback: () => {
                        this.history.list[0].setContentToEditableDiv(contenteditableDiv);
                        imagePreview.src = this.history.list[0].src;
                    }
                }, {
                    text: 'No',
                    callback: () => {
                    }
                });
            });


            historyDom.appendChild(container);
        } else {
            console.warn("Source data not provided for the DomElement creation of the ImageInstance")
        }
    }

    addButton(icon,f) {
        let btn = document.createElement('button');
        btn.classList.add('btn');
        
        let img = document.createElement('img');
        img.src = 'img/icons/'+icon+'.png';
        btn.appendChild(img);
        // event listener click with function f and the button as parameter
        btn.addEventListener('click', () => {
            f(btn);
        });
        this.buttons.appendChild(btn);
    }

    // Appends the hex data to the content editable div
    setContentToEditableDiv(parent) {
        let arr = this.hex.split('');

        parent.innerHTML = this.hex;

        let highlight = document.createElement('div');
        highlight.classList.add('highlight');
        highlight.spellcheck = false;

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
                highlight.innerHTML += '\u200A'.repeat(i==0 ? count : count-1);
                oldIndex = coord;
                highlight.innerHTML += arr[coord];
            };
        }

        let targetHighlight = document.createElement('div');
        targetHighlight.classList.add('targetHighlight');
        targetHighlight.spellcheck = false;
        if (this.history) {
            if (this.history.targetDiff) {
                let coords = [];
                for (let i of this.history.targetDiff) {
                    coords.push(i.index);
                }
                coords = coords.sort((a, b) => a - b);
                
                let oldIndex = 0;
                for (let i=0 ; i<coords.length ; i++) {
                    let coord = coords[i];
                    let count = coord-oldIndex
                    targetHighlight.innerHTML += '\u200A'.repeat(i==0 ? count : count-1);
                    oldIndex = coord;
                    targetHighlight.innerHTML += arr[coord];
                };
            };
        };
        
        parent.appendChild(highlight);
        parent.appendChild(targetHighlight);
    }
}

class sessionHistory {
    metatata;
    list = [];
    active;
    defaultHex;
    targetDiff;
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
        this.list = [this.list[0]];
        historyDom.innerHTML = '';
        this.add(this.defaultHex);
        imagePreview.src = this.list[0].src;
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

    remove(element) {
        const index = this.list.indexOf(element);
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