import { ElementModel } from "./elementModel.js";
import { std } from "../../renderer/index.js";
class Element extends ElementModel {
    constructor(shape, color) {
        super(`${Element.elementID}${Element.lastUsedKey++}`, shape.vertices);
        this.lightDirection = [1, 1, 1];
        if (!(color instanceof Array)) {
            let colors = [];
            for (let i = 0; i < shape.vertices.length / 3; i++)
                colors.push(color.r, color.g, color.b, color.a);
            color = colors;
        }
        Element.game.renderer.create({
            id: this.id,
            fragment: std.depthFragment,
            vertex: std.depthVertex,
            verticesAttribute: "position",
            attributes: {
                position: {
                    data: shape.vertices,
                    type: 'f32x4',
                    location: 0,
                },
                color: {
                    data: color,
                    type: 'f32x4',
                    location: 1,
                },
                normal: {
                    data: shape.normals,
                    type: 'f32x3',
                    location: 2,
                }
            },
            uniforms: [{
                    group: 0,
                    binding: 0,
                    data: {
                        perspective: {
                            data: Element.game.view.perspectiveMatrix,
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
Element.elementID = 'basic-element';
Element.lastUsedKey = 0;
export { Element };
