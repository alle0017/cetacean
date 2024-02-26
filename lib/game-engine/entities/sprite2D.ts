import { ElementModel } from "./elementModel.js";
import { std, Shapes } from "../../renderer/index.js";
import * as Mat from '../../math/matrix/index.js'

export class Sprite2D extends ElementModel {

      private static readonly elementID: string = 'sprite_2D-';
      private static lastUsedKey: number = 0;

      private lightDirection: [number, number, number] = [1, 1, 1];

      constructor( texture: string | URL ){

            const shape = Shapes.rectangle();

            super( `${Sprite2D.elementID}${Sprite2D.lastUsedKey++}` );

            if( texture instanceof URL )
                  texture = texture.toString();

            Sprite2D.game.loader.image( texture ).then( ( (image: ImageBitmap)=>{
                  
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

                                          1, 1,
                                          0, 0,
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

                                    transformation: {
                                          data: this.transformation,
                                          type: 'f32'
                                    },
                                    perspective: {
                                          data: Sprite2D.game.view.perspectiveMatrix,
                                          type: 'f32'
                                    },
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
                  })
            }).bind(this));
      }
}