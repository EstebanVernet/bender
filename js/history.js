const historyDom = document.getElementById('history');

class history {
    list;

    constructor() {
        // if ctrl+z, remove last item and rollback
        this.list = [];

        document.addEventListener('keydown', function(event) {
            if (event.ctrlKey && event.key === 'z') {
                if (History.length > 0) {
                    const last = History.get(History.length - 2);
                    previousString = last.hexdata;
                    contenteditableDiv.innerText = last.hexdata;
                    imagePreview.src = last.domElement.firstChild.src;
                    History.remove(History.length - 1);
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

    get length() {
        return this.list.length;
    }

    reset() {
        this.list = [];
        historyDom.innerHTML = '';
    }
}

class historyImage {
    domElement;
    hexdata;
    constructor(hex) {

        let container = document.createElement('div');
        container.classList.add('history-image-container');

        let img = document.createElement('img');
        this.hexdata = hex;
        img.src = this.build(hex);
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

        historyDom.appendChild(container);
        this.domElement = container;
    }

    build(hex) {
        const hexArray = hex.match(/.{1,2}/g);
        const byteArray = hexArray.map(byte => parseInt(byte, 16));
        const blob = new Blob([new Uint8Array(byteArray)], {type: 'image/png'});
        const url = URL.createObjectURL(blob);
        return url;
    }
}