require("./lib/sound.js")
require("./lib/base64.js")
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

  const MIN = 9
  const MAX = 20

  const connectedSound = new game.Sound("assets/connected", 10)

  const JSAW = new jigsaw.Jigsaw({
      defaultImage: "assets/lit3d.png",
      defaultPieces: 9,
  });

  JSAW.eventBus.on(jigsaw.Events.PIECES_CONNECTED, function() {
      connectedSound.play()
  });

  window._ShowWIN = () => JSAW.ui.show_time()

  window._ShowImageSelector = () => {
    const imageSelector = document.querySelector(".imageSelector")
    if (!imageSelector) return

    imageSelector.classList.remove("imageSelector--hide")

    const imageList = JSON.parse(Base64.decode(window._ImageListBase64))

    imageList.forEach(data =>{

      const figureNode = document.createElement("figure")
      figureNode.classList.add("imageSelector__item")

      const imageWrapper = document.createElement("div")
      imageWrapper.classList.add("imageSelector__item-image")
      figureNode.appendChild(imageWrapper)

      imageWrapper.style.backgroundImage = `url("images/${data.fileName}")`

      const figcaptionNode = document.createElement("figcaption")
      figcaptionNode.classList.add("imageSelector__item-caption")
      figcaptionNode.innerHTML = data.title
      figureNode.appendChild(figcaptionNode)

      figureNode.addEventListener("click", () => {
        const pieces = data.pieces || Math.round(MIN + Math.random() * (MAX - MIN))

        JSAW.set_image(`images/${data.fileName}`)

        JSAW.eventBus.emit(jigsaw.Events.JIGSAW_SHUFFLE)
        JSAW.eventBus.emit(jigsaw.Events.PARTS_NUMBER_CHANGED, pieces)
        JSAW.eventBus.emit(jigsaw.Events.RENDER_REQUEST)


        imageSelector.classList.add("imageSelector--hide")
      })

      imageSelector.appendChild(figureNode)

    })
  }
}()