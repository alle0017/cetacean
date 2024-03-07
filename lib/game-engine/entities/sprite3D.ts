import { ElementModel } from "./elementModel.js";
import { std, } from "../../renderer/index.js";

import type { ShapeDescriptor, Sprite3DOpt } from "../../types.d.ts";



export class Sprite3D extends ElementModel {

      private static readonly elementID: string = 'sprite_3D-';
      private static lastUsedKey: number = 0;

      private lightDirection: [number, number, number] = [1, 1, 1];
      private min: [number,number];
      private max: [number,number];

      protected animationVec: [ number, number ] = [0,0];
      

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
            this.max = max;
            this.min = min;
      }
      private createSprite( shape: ShapeDescriptor, image: ImageBitmap ) {
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
                                    data: this.min,
                                    type: 'f32x2',
                              },
                              coords_max: {
                                    data: this.max,
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
                              animation_vec: {
                                    data: [0,0],
                                    type: 'f32x2',
                              }
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
            this.z -= 500;
            this.xAngle = 20;
      }
      constructor( opt: Sprite3DOpt ){

            super(`${Sprite3D.elementID}${Sprite3D.lastUsedKey++}`)

            this.findMinMaxCoords( opt.shape.vertices );

            if( opt.image instanceof URL )
                  opt.image = opt.image.toString();
            else if( opt.image instanceof ImageBitmap ){
                  this.createSprite( opt.shape, opt.image );
                  return;
            }

            Sprite3D.game.loader.image( opt.image ).then( ( (image: ImageBitmap) =>{
                  this.createSprite( opt.shape, image );
            }).bind(this));
      }
}