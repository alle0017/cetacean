import { ElementModel } from "./elementModel.js";
import { std, Shapes } from "../../renderer/index.js";
import { Sprite3D } from "./sprite3D.js";
import * as Mat from '../../math/matrix/index.js'

export class Sprite2D extends Sprite3D {

      constructor( texture: string | URL ){

            const shape = Shapes.rectangle();
            
            super( texture, shape );
      }
}