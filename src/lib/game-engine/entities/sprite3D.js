import { ElementModel } from "./elementModel.js";
import { std, } from "../../renderer/index.js";
class Sprite3D extends ElementModel {
    findMinMaxCoords(vertices) {
        const max = [vertices[0], vertices[1]];
        const min = [vertices[0], vertices[1]];
        for (let i = 0; i < vertices.length; i += 4) {
            for (let j = 0; j < 2; j++) {
                if (vertices[i + j] > max[j]) {
                    max[j] = vertices[i + j];
                }
                else if (vertices[i + j] < min[j]) {
                    min[j] = vertices[i + j];
                }
            }
        }
        return {
            max,
            min,
        };
    }
    constructor(texture, shape) {
        super(`${Sprite3D.elementID}${Sprite3D.lastUsedKey++}`);
        this.lightDirection = [1, 1, 1];
        const { min, max } = this.findMinMaxCoords(shape.vertices);
        if (texture instanceof URL)
            texture = texture.toString();
        Sprite3D.game.loader.image(texture).then(((image) => {
            Sprite3D.game.renderer.create({
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
                    normal: {
                        data: shape.normals,
                        type: 'f32x3',
                        location: 1,
                    },
                },
                uniforms: [{
                        group: 0,
                        binding: 0,
                        data: {
                            transformation: {
                                data: this.transformation,
                                type: 'f32x4'
                            },
                            perspective: {
                                data: Sprite3D.game.view.perspectiveMatrix,
                                type: 'f32x4'
                            },
                            coords_min: {
                                data: min,
                                type: 'f32x2',
                            },
                            coords_max: {
                                data: max,
                                type: 'f32x2',
                            },
                        }
                    }, {
                        group: 0,
                        binding: 1,
                        data: {
                            light_direction: {
                                data: this.lightDirection,
                                type: 'f32x3'
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
            this.z -= 500;
            this.xAngle = 20;
        }).bind(this));
    }
}
Sprite3D.elementID = 'sprite_3D-';
Sprite3D.lastUsedKey = 0;
export { Sprite3D };
