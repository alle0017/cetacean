import { ElementModel } from "./elementModel.js";
import * as Mat from '../../math/matrix/index.js';
import { std } from "../../renderer/index.js";
class Sprite2D extends ElementModel {
    constructor(texture) {
        super(`${Sprite.elementID}${Sprite.lastUsedKey++}`);
        this.lightDirection = [1, 1, 0];
        Sprite.game.renderer.create({
            id: this.id,
            fragment: std.lightFragment,
            vertex: std.lightVertex,
            verticesAttribute: "position",
            attributes: {
                position: {
                    data: [],
                    type: 'f32x4',
                    location: 0,
                },
                normal: {
                    data: [],
                    type: 'f32x3',
                    location: 2,
                }
            },
            uniforms: [{
                    group: 0,
                    binding: 0,
                    data: {
                        perspective: {
                            data: Mat.IDENTITY_4X4,
                            type: 'f32'
                        },
                        transformation: {
                            data: this.transformation,
                            type: 'f32'
                        }
                    }
                }, {
                    group: 0,
                    binding: 1,
                    data: {
                        light_direction: {
                            data: [...this.lightDirection, 1],
                            type: 'f32'
                        },
                    }
                }],
            index: shape.indices
        });
    }
}
Sprite2D.elementID = 'basic-element';
Sprite2D.lastUsedKey = 0;
export { Sprite2D };
