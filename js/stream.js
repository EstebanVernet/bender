class stream {
    canvas;
    ctx;
    buffer;
    video;

    constructor() {
        var video = document.createElement('video');
        video.width=1080;
        video.height=1080;
        
        video.autoplay = true;
        video.controls = true;
        this.video = video;

        document.body.appendChild(video);

        var mediaSource = new MediaSource();

        var canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;

        this.canvas = canvas;

        var ctx = canvas.getContext('2d');
        this.ctx = ctx;
        
        mediaSource.addEventListener('sourceopen', () => {
            var sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
            this.buffer = sourceBuffer;
            
            sourceBuffer.addEventListener('updateend', () => {
                if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
                    mediaSource.endOfStream();
                }
            });
            
        });

        video.src = URL.createObjectURL(mediaSource);

    }

    appendImage(data) {
        var image = new Image();
        image.src = data;
        image.onload = () => {
            this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);

            this.canvas.toBlob((blob) => {
                blob.arrayBuffer().then((arrayBuffer) => {
                    console.log(this.buffer.updating, this.buffer.readyState, arrayBuffer.byteLength, this.video.error)
                    if (this.buffer && this.buffer.updating === false && this.buffer.readyState === 'open' && arrayBuffer.byteLength > 0 && this.video.error === null) {
                        this.buffer.appendBuffer(arrayBuffer);
                        this.video.play();
                    }
                });
                console.log(blob);
            }, 'video/webm');
            
        };
    }
}