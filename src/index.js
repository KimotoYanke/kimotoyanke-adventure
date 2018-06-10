// @flow
import {compose, divide} from 'ramda'
import keypress from 'keypress'
import {cursorTo, eraseScreen, cursorHide, cursorShow} from 'ansi-escapes'
import {Field, Tile, FieldLayer} from './field'
import {Player} from './creature'
import {Dungeon} from './generate-field'
keypress(process.stdin)

const divideInteger = compose(Math.round, divide)
// @flow-ignore
const screenWidth = process.stdout.columns
// @flow-ignore
const screenHeight = process.stdout.rows
const width = divideInteger(screenWidth, 5 / 4)
const height = divideInteger(screenHeight, 5 / 4)
const field:Dungeon = new Dungeon(width, height)

process.stdout.write(eraseScreen + cursorHide)

process.on('exit', () => {
  process.stdout.write(eraseScreen + cursorShow)
})

// @flow-ignore
process.stdin.setRawMode(true)
field.layers[0].setWall()
field.generate()
const player = new Player(field.stairPosition[0], field.stairPosition[1], field)

process.stdin.on('keypress', (ch, key) => {
  if (key) {
    if (key.ctrl && key.name === 'c') {
      process.exit(0)
    }
    if (key.name === 'h') {
      player.moveNear(-1, 0)
    }
    if (key.name === 'j') {
      player.moveNear(0, 1)
    }
    if (key.name === 'k') {
      player.moveNear(0, -1)
    }
    if (key.name === 'l') {
      player.moveNear(1, 0)
    }
    field.render()
  }
})
process.stdin.resume()
field.render()
