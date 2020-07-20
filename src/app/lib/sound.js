;(function() {
var currentAudio = 0,
    support    = window.Audio && (new Audio).canPlayType,
    TOTAL      = 0;

// Sound manager
// create n audio objects
function Sound(file, n) {
    if (!support) { return; }
    var i;
    
    this.file = file;
    TOTAL = n;
    
    this.audio = [];
    
    for (i = 0; i < n; i++) {
        this.audio[i] = new Audio();
    }

    this.load()
}

Sound.prototype.load = function() {
    if (!support) { return; }
    var ext = this.audio[0].canPlayType("audio/mp3") ? ".mp3" : ".ogg";

    for (var i = 0; i < TOTAL; i++) {
        this.audio[i].src = this.file + ext;
    }
}

// iterate over the available audio objects
Sound.prototype.play = function() {
    if (!support) { return; }
    this.audio[currentAudio].play();
    currentAudio = (currentAudio+1)%TOTAL;
}

window.game = window.game || {};
game.Sound = Sound;
}());
