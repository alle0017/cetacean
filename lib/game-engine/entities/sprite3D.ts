import { Game } from "../game.js";
import { ElementModel } from "./elementModel.js";

import * as Mat from '../../math/matrix/index.js';

import { Axis } from "../../enum.js";
import { std, Shapes } from "../../renderer/index.js";

import type { ShapeDescriptor } from "../../types.d.ts";


export class Sprite3D extends ElementModel {

      private static readonly elementID: string = 'sprite_3D-';
      private static lastUsedKey: number = 0;

      private lightDirection: [number, number, number] = [1, 1, 1];

      private findMinMaxCoords( vertices: number[] ){
            const max: [number, number] = [ vertices[0], vertices[1] ];
            const min: [number, number] = [ vertices[0], vertices[1] ];

            for( let i = 0; i < vertices.length; i+= 4 ){
                  for( let j = 0; j < 2; j++ ){
                        if( vertices[i + j] > max[j] ){
                              max[j] = vertices[i + j]
                        }else if( vertices[i + j] < min[j] ){
                              min[j] = vertices[i + j]
                        }
                  }
            }
            return {
                  max,
                  min,
            }
      }
      constructor( texture: string | URL, shape: ShapeDescriptor ){

            super(`${Sprite3D.elementID}${Sprite3D.lastUsedKey++}`)

            const { min, max } = this.findMinMaxCoords( shape.vertices );

            if( texture instanceof URL )
                  texture = texture.toString();

            Sprite3D.game.loader.image( texture ).then( ( (image: ImageBitmap) =>{
            
                  Sprite3D.game.renderer.create({
                        id: this.id,
                        fragment: std.textureFragment,

                        vertex: std.texture3DVertex,
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
                                          type: 'f32'
                                    },
                                    perspective: {
                                          data: Sprite3D.game.view.perspectiveMatrix,
                                          type: 'f32'
                                    },
                                    coords_min: {
                                          data: min,
                                          type: 'f32',
                                    },

                                    coords_max: {
                                          data: max,
                                          type: 'f32',
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