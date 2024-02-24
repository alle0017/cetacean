import { Game } from "../game.js";
import { ElementModel } from "./elementModel.js";

import * as Mat from '../../math/matrix/index.js';

import { Axis } from "../../enum.js";
import { std, Shapes } from "../../renderer/index.js";

import type { ShapeDescriptor } from "../../types.d.ts";
import type { Color } from '../../renderer/types.d.ts';

/**
@ignore
u = (x - xmin) / (xmax - xmin)
v = (y - ymin) / (ymax - ymin)

Where (xmin,ymin)(xmin​,ymin​) and (xmax,ymax)(xmax​,ymax​) represent the minimum and maximum extents of your mesh along the X and Y axes.

utex​=u×width
vtex=v×height
 */

export class Sprite2D extends ElementModel {

      private static readonly elementID: string = 'sprite_2D-';
      private static lastUsedKey: number = 0;

      private lightDirection: [number, number, number] = [1, 1, 1];

      private findMinMaxCoords( vertices: number[] ){
            const max = [ vertices[0], vertices[1] ];
            const min = [ vertices[0], vertices[1] ];

            for( let i = 0; i < vertices.length/4; i+= 4 ){
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
      constructor( texture: string | URL ){

            const shape = Shapes.rectangle();

            super( `${Sprite2D.elementID}${Sprite2D.lastUsedKey++}` );

            if( texture instanceof URL )
                  texture = texture.toString();

            Sprite2D.game.loader.image( texture ).then( ( (image: ImageBitmap) =>{
            
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
                  })
            }).bind(this));
      }
}