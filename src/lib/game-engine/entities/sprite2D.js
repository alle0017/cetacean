import { Shapes } from "../../renderer/index.js";
import { Sprite3D } from "./sprite3D.js";
export class Sprite2D extends Sprite3D {
    constructor(texture) {
        const shape = Shapes.rectangle();
        super(texture, shape);
    }
}
