const { promises: fs } = require("fs")

const { resolve, extname } = require("path")
const PATH = (...p) => resolve(__dirname, ...p)
const IMAGES_PATH = PATH("app/images")


module.exports = async function() {
  const fileList = await fs.readdir(IMAGES_PATH)

  return fileList.map(fileName => {
                    const match = /^\s*(.*?)(\s*-\s*(\d+))?\.png$/i.exec(fileName)
                    if (!match) return undefined

                    const [,title,,pieces] =  match
                    return {fileName, title, pieces: Number.parseInt(pieces) || 0}
                 }).filter(v => !!v)
}
