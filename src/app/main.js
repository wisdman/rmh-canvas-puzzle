require("./lib/sound.js")
require("./lib/event-emiter.js")
require("./lib/canvas-event/class.js")
require("./lib/canvas-event/events.js")
require("./lib/canvas-event/shapes.js")
require("./lib/utils.js")
require("./lib/jigsaw-objects.js")
require("./lib/jigsaw-controller.js")
require("./lib/jigsaw-ui.js")
require("./lib/jigsaw-events.js")
require("./lib/modal-window.js")

void function main(){
  const connectedSound = new game.Sound("assets/connected", 10);
  const JSAW = new jigsaw.Jigsaw({
      defaultImage: "assets/lit3d.png",
      spread: .5,
      defaultPieces: 8,
  });

  JSAW.eventBus.on(jigsaw.Events.PIECES_CONNECTED, function() {
      connectedSound.play();
  });
}()