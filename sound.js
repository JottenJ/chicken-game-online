// Ljudeffekter och ambient musik
class SoundManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        this.loadSounds();
    }

    async loadSounds() {
        // Temporärt avaktiverade ljudfiler tills de finns
        const soundFiles = {
            // roll: 'sounds/roll.mp3',
            // win: 'sounds/win.mp3',
            // bust: 'sounds/bust.mp3',
            // bank: 'sounds/bank.mp3'
        };

        for (const [name, path] of Object.entries(soundFiles)) {
            try {
                const response = await fetch(path);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
                this.sounds[name] = audioBuffer;
            } catch (error) {
                console.warn(`Kunde inte ladda ljud: ${path}`, error);
            }
        }
    }

    play(soundName, options = {}) {
        if (!this.sounds[soundName]) return;
        
        const source = this.context.createBufferSource();
        source.buffer = this.sounds[soundName];
        
        const gainNode = this.context.createGain();
        gainNode.gain.value = options.volume || 1;
        
        source.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        if (options.loop) {
            source.loop = true;
        }
        
        source.start(0);
        return source;
    }

    playMusic() {
        if (!this.music) {
            this.music = this.context.createOscillator();
            this.music.type = 'sine';
            this.music.frequency.setValueAtTime(440, this.context.currentTime);
            
            const gainNode = this.context.createGain();
            gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
            
            this.music.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            this.music.start();
        }
    }

    stopMusic() {
        if (this.music) {
            this.music.stop();
            this.music = null;
        }
    }
}

// Exportera för användning i huvudappen
window.SoundManager = SoundManager;