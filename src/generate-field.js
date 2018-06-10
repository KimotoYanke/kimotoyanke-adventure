// @flow
import {range} from 'ramda'
import {Field, Tile, Layer} from './field'
export class Dungeon extends Field {
  wallTile:Tile
  airTile:Tile
  constructor (width:number, height:number) {
    super(width, height)
    this.wallTile = new Tile('#')
    this.airTile = new Tile('.')
  }

  generateRoom (x:number, y:number, width:number, height:number) {
    for (let i = 1; i < width - 1; i++) {
      for (let j = 1; j < height - 1; j++) {
        this.layers[0].set(x + i, y + j, this.airTile)
      }
    }
    const setIfThereIsNone = (layer:Layer, x:number, y:number, tile:Tile) => {
      if (layer.get(x, y).toString() === ' ') {
        layer.set(x, y, this.wallTile)
      }
    }
    for (let i = 0; i < width; i++) {
      setIfThereIsNone(this.layers[0], x + i, y, this.wallTile)
      setIfThereIsNone(this.layers[0], x + i, y + height - 1, this.wallTile)
    }
    for (let i = 0; i < height; i++) {
      setIfThereIsNone(this.layers[0], x, y + i, this.wallTile)
      setIfThereIsNone(this.layers[0], x + width - 1, y + i, this.wallTile)
    }
  }

  generate () {
    range(0, 5).forEach(_ => {
      const x = Math.floor(Math.random() * (this.width - 1)) + 1
      const y = Math.floor(Math.random() * (this.height - 1)) + 1
      const width = Math.max(Math.min(x + Math.floor(Math.random() * this.width / 2), this.width) - x, 3)
      const height = Math.max(Math.min(y + Math.floor(Math.random() * this.height / 2), this.height) - y, 3)
      this.generateRoom(x, y, width, height)
    })

    const centralX = Math.floor(this.width / 2)
    const centralY = Math.floor(this.height / 2)
    const width = Math.max(Math.min(centralX + Math.floor(Math.random() * this.width / 2), this.width) - centralX, 3)
    const height = Math.max(Math.min(centralY + Math.floor(Math.random() * this.height / 2), this.height) - centralY, 3)
    const x = Math.floor(centralX - width / 2)
    const y = Math.floor(centralY - height / 2)
    this.generateRoom(x, y, width, height)
    this.setStair(centralX, centralY)
  }
  stairPosition:[number, number]
  setStair (x:number, y:number) {
    this.stairPosition = [x, y]
    this.layers[0].set(x, y, new Tile('>'))
  }
}
