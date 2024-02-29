import Renderer from "./lib/renderer/renderer.js";
import { std } from './lib/renderer/index.js';
import * as Mat from './lib/math/matrix/index.js'
import { Game, Scene, Element, Sprite2D, Shapes, Sprite3D  } from './lib/index.js';

class MyScene extends Scene {
      constructor( game: Game ){
            super(game);
            //const s = new Sprite2D('./icon.png')
            const s = new Sprite3D('./icon.png', {
                  vertices: [
                        1, 1, 1, 1,
                        -1, 1, 1, 1, 
                        1, -1, 1, 1, 
                        -1, -1, 1, 1,

                        -1, 1, 1, 1,
                        -1, 1, -1, 1,
                        -1, -1, -1, 1,
                        -1, -1, 1, 1,

                        -1, 1, 1, 1,
                        1, 1, 1, 1,
                        1, 1, -1, 1,
                        -1, 1, -1, 1,

                        -1, -1, -1, 1,
                        1,-1, -1, 1,
                        1, -1, 1, 1,
                        -1, -1, 1, 1,

                        1, 1, 1, 1,
                        -1, 1, 1, 1,
                        -1, -1, 1, 1,
                        1, -1, 1, 1,

                        -1, 1, -1, 1,
                        1, 1, -1, 1,
                        1, -1, -1, 1,
                        -1, -1, -1, 1
                  ],
                  indices: [
                        0, 1, 2,
                        0, 2, 3,
                        4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
                  ],
                  normals: [
                        1, 0, 0, 
                        1, 0, 0, 
                        1, 0, 0, 
                        1, 0, 0, 

                        -1, 0, 0,
                        -1, 0, 0, 
                        -1, 0, 0, 
                        -1, 0, 0, 

                        0, 1, 0, 
                        0, 1, 0, 
                        0, 1, 0, 
                        0, 1, 0, 

                        0, -1, 0, 
                        0, -1, 0, 
                        0, -1, 0,
                        0, -1, 0, 

                        0, 0, 1, 
                        0, 0, 1, 
                        0, 0, 1, 
                        0, 0, 1, 

                        0, 0, -1, 
                        0, 0, -1, 
                        0, 0, -1, 
                        0, 0, -1 
                  ]
            })
            
            setInterval( ()=>{s.xAngle += 0.0001; console.log( s.xAngle )}, 100 )
      } 
}

const game = Game.new();

game.scene( MyScene, 'my-scene' );

game.changeScene('my-scene');

//game.changeScene('my-scene-2');
/*
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
*/