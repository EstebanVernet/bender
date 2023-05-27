class toast {
    dom = document.getElementById('toast');
    domText = document.getElementById('toast-text');
    domButtons = document.getElementById('toast-buttons');
    constructor() {
    }

    show(text,...actions) {

        this.dom.classList.remove('toast_hidden');
        this.domText.innerHTML = text;

        if (actions.length > 0) {
            for (let action of actions) {
                let txt = action.text;
                let callback = action.callback;
                let button = document.createElement('button');
                button.innerText = `(CTRL+ALT+${actions.indexOf(action)+1}) ${txt}`;
                button.addEventListener('click', () => {
                    this.hide();
                    callback();
                    let btns = this.dom.getElementsByTagName('button');
                    for (let btn of btns) {
                        btn.disabled = true;
                    }
                });
                this.domButtons.appendChild(button);
            }


            let toastEvent = (event) => {
                if (!event.ctrlKey) return;
                if (!event.altKey) return;
                if (event.key > 0 && event.key <= actions.length) {
                    let button = this.domButtons.getElementsByTagName('button')[event.key-1];
                    button.click();
                    // Remove the event listener
                    document.removeEventListener('keydown', toastEvent);
                }
            }
            document.addEventListener('keydown', toastEvent);
        }

    }

    hide() {
        this.dom.classList.add('toast_hidden');
        setTimeout(() => {
            this.reset();
        }, 300);
    }

    reset() {
        this.domText.innerHTML = '';
        this.domButtons.innerHTML = '';
    }
}

/*
setTimeout(() => {
    Toast.show('Hello World', {
        text: 'OK',
        callback: () => {
            console.log('OK');
        }
    }, {
        text: 'Cancel',
        callback: () => {
            console.log('Cancel');
        }
    });
}, 2000);
*/