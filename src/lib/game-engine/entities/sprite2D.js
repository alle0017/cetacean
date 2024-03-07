import { Shapes } from "../../renderer/index.js";
import { Sprite3D, } from "./sprite3D.js";
export class Sprite2D extends Sprite3D {
    constructor(opt) {
        const shape = Shapes.rectangle();
        super(Object.assign(Object.assign({}, opt), { shape }));
    }
}
