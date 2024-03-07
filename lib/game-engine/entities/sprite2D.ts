import { Shapes } from "../../renderer/index.js";
import { Sprite3D, } from "./sprite3D.js";
import * as Mat from '../../math/matrix/index.js'
import type { Sprite2DOpt, } from "../../types.d.ts";

export class Sprite2D extends Sprite3D {

      constructor( opt: Sprite2DOpt  ){

            const shape = Shapes.rectangle();
            
            super( { ...opt, shape} );
      }
}