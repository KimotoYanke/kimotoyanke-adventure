// @flow
import {Tile, Layer, Field} from './field'
class Creature {
  position:[number, number]
  layer:Layer
  field:Field
  constructor (x:number, y:number, field:Field, layer:Layer = field.layers[1]) {
    this.position = [x, y]
    this.field = field
    this.layer = layer
    this.layer.set(x, y, new Tile('@'))
  }
  move (newX:number, newY:number):boolean {
    if (this.field.isWall(newX, newY)) {
      return false
    }
    this.layer.remove(this.position[0], this.position[1])
    this.layer.set(newX, newY, new Tile('@'))
    this.position[0] = newX
    this.position[1] = newY
    return true
  }
}
export class Player extends Creature {
  moveNear (x:number, y:number) {
    this.move(this.position[0] + x, this.position[1] + y)
  }
}
