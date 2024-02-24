import { ElementModel } from "./elementModel.js";
import * as Mat from '../../math/matrix/index.js';
import { std, Shapes } from "../../renderer/index.js";
class Sprite2D extends ElementModel {
    constructor(texture) {
        const shape = Shapes.rectangle();
        super(`${Sprite2D.elementID}${Sprite2D.lastUsedKey++}`);
        this.lightDirection = [1, 1, 1];
        if (texture instanceof URL)
            texture = texture.toString();
        Sprite2D.game.loader.image(texture).then(((image) => {
            Sprite2D.game.renderer.create({
                id: this.id,
                fragment: std.textureFragment,
                vertex: std.textureVertex,
                verticesAttribute: "position",
                attributes: {
                    position: {
                        data: shape.vertices,
                        type: 'f32x4',
                        location: 0,
                    },
                    tex_coords: {
                        data: [
                            0, 0,
                            1, 1,
                            1, 0,
                            0, 1,
                        ],
                        type: 'f32x2',
                        location: 1,
                    },
                    normal: {
                        data: shape.normals,
                        type: 'f32x3',
                        location: 2,
                    },
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
                    }, {
                        group: 1,
                        binding: 0,
                        data: image,
                    }, {
                        group: 1,
                        binding: 1,
                        data: 'sampler',
                    }],
                index: shape.indices
            });
        }).bind(this));
    }
}
Sprite2D.elementID = 'sprite_2D-';
Sprite2D.lastUsedKey = 0;
export { Sprite2D };
