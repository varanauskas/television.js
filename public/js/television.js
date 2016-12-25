class television {
    constructor(player) {
        this.player = player;
    }

    action(data) {
        switch (data.action) {
            case 'play':
                this.play();
                break;
            case 'pause':
                this.pause();
                break;
            case 'open':
                this.open(data.source);
                data.state.time = 0;
                break;
            case 'sync':
                this.sync(data.state);
                break;
            default:
                break;
        }
        this.seek(data.state.time);
    }

    sync(state) {
        if (state.source) {
            this.open(state.source);
        }
        if (state.playing) {
            this.play();
        } else {
            this.pause();
        }
    }

    open(source) {
        this.player.src = source;
        this.player.load();
    }
    play() {
        this.player.play();
    }
    pause() {
        this.player.pause();
    }
    seek(time) {
        this.player.currentTime = time;
    }

    get time() {
        return this.player.currentTime;
    }
}