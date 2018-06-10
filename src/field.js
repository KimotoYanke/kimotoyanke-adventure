// @flow
import {repeat, identity} from 'ramda'
import {cursorTo} from 'ansi-escapes'
import getToolbar from './toolbar'
// type Tile = string
export class Tile {
  c:string
  styling:string=>string
  constructor (c:string, styling:string=>string = identity) {
    this.c = c
    this.styling = styling
  }
  toString ():string {
    return this.c
  }
  render ():string {
    return this.styling(this.toString())
  }
  copy () {
    return new Tile(this.toString(), this.styling)
  }
}
const spaceTile = new Tile(' ')
type Diff = {c:string, position:[number, number]}
export class Layer {
  objects: Map<string, Tile>
  constructor () {
    this.objects = new Map()
  }
  get (x:number, y:number):Tile {
    return this.objects.get(x + ',' + y) || new Tile(' ')
  }
  set (x:number, y:number, tile:Tile) {
    this.objects.set(x + ',' + y, tile)
  }
  remove (x:number, y:number) {
    this.set(x, y, spaceTile)
  }
}
export class FieldLayer extends Layer {
  width:number
  height:number
  constructor (width:number, height:number, defStr:string = '.') {
    super()
    this.width = width
    this.height = height
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.set(x, y, new Tile(defStr))
      }
    }
  }
  setWall (tile:Tile = new Tile('#'), x:number = 0, y:number = 0, width:number = this.width, height:number = this.height) {
    for (let i = 0; i < width; i++) {
      this.set(x + i, y, tile)
      this.set(x + i, y + height - 1, tile)
    }
    for (let i = 0; i < height; i++) {
      this.set(x, y + i, tile)
      this.set(x + width - 1, y + i, tile)
    }
  }
}
export class Field {
  before:string[][]
  renderCounter:number

  width:number
  height:number

  fieldWidth:number
  fieldHeight:number

  layers:[FieldLayer, Layer]

  constructor (width:number, height:number, defStr:string = ' ') {
    this.renderCounter = 0
    this.layers = [(new FieldLayer(width, height, ' ')), new Layer()]
    this.width = width
    this.height = height
    this.fieldWidth = width
    this.fieldHeight = height - 1
  }
  isWall (x:number, y:number):boolean {
    switch (this.getTile(x, y).toString()) {
      case '#':
        return true
    }
    return false
  }
  getTile (x:number, y:number): Tile {
    for (let i = 0; i < this.layers.length; i++) {
      const tile:?Tile = this.layers[this.layers.length - i - 1].get(x, y)
      if (tile && tile.toString() !== ' ' && tile.toString() !== '') {
        return tile
      }
    }
    return spaceTile
  }
  before: Array<Array<string>>
  getDiff ():Diff[] {
    const diffs:Diff[] = []
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.getTile(x, y)
        const c = tile ? tile.render() : ' '
        if (this.before[y][x] !== c) {
          diffs.push({c, position: [x, y]})
        }
        this.before[y][x] = c
      }
    }
    return diffs
  }
  render () {
    this.renderCounter++
    let output = ''
    if (!this.before) {
      this.before = []
      for (let y = 0; y < this.height; y++) {
        this.before[y] = []
        for (let x = 0; x < this.width; x++) {
          output += cursorTo(x, y) + this.getTile(x, y).toString()
          this.before[y][x] = this.getTile(x, y).toString()
        }
      }
    } else {
      const diffs = this.getDiff()
      if (diffs.length === 0) {
        return
      }
      const cursorNow:[number, number] = diffs[0].position
      process.stdout.write(cursorTo(cursorNow[0], cursorNow[1]))
      output = diffs.reduce((output:string, {c, position: [x, y]}) => {
        if (cursorNow[0] === x && cursorNow[1] === y) {
          return output + c
        } else {
          cursorNow[0] = x + 1
          cursorNow[1] = y
          return output + cursorTo(x, y) + c
        }
      }, '')
    }
    if (output.length) {
      process.stdout.write(output + this.renderToolbar())
    }
  }
  beforeToolbar:string
  renderToolbar ():string {
    const toolbar = getToolbar({renderCounter: this.renderCounter})
    if (this.beforeToolbar !== toolbar) {
      return cursorTo(0, this.height) +
        (this.beforeToolbar = toolbar)
    }
    return ''
  }
}
