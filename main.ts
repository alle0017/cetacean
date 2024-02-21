import Renderer from "./lib/renderer/renderer.js";
import { std } from './lib/renderer/index.js';
import * as Mat from './lib/math/matrix/index.js'


const r = new Renderer();
const view = new Mat.ViewDelegate(r.cvs.width/r.cvs.height);
r.create({
            id: "triangle",
            verticesAttribute: 'position',
            attributes: {
                  position: {
                        type: 'f32x3',
                        location: 0,
                        data: [
                              -1, 1, 0.5, 1,
                              -1, -1, 0.5, 1,
                              0, 1, 0.5, 1,
                        ],
                  },
                  color: {
                        type: 'f32x4',
                        location: 1,
                        data: [
                              0, 1, 0, 1,
                              1, 0, 0, 1,
                              1, 0, 0, 1,
                        ],
                  },
            },
            uniforms: [{
                  binding: 0,
                  group: 0,
                  data: {
                        perspective: {
                              type: 'f32',
                              data: Mat.IDENTITY_4X4,
                        },
                        transformation: {
                              type: 'f32',
                              data: Mat.IDENTITY_4X4
                        },
                        
                  },
            },{
                  binding: 1,
                  group: 0,
                  data: {
                        light_direction: {
                              type: 'f32',
                              data: [0.5,0.5,0,0],
                        },
                  },
            }],
            vertex: std.basicVertex,
            fragment: std.basicFragment,
});
r.render();