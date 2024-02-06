import { types } from "../enums.js";
import type { AttributeDescriptor, TypedArray, Drawable, ShaderMessage } from "../types.d.ts";

export default abstract class Engine {
      /**bind two arrays by mixing them and returns the offset of the next attribute to mix */
      protected mixArrays( mappedRange: ArrayBuffer, attributes: Record<string, AttributeDescriptor>, stride: number ){
      
            const arrays: Record<string,TypedArray> = {};
            let offset = 0;

            for( const v of Object.values( attributes ) ){
                  
                  if( !arrays[ types[v.type].atomic ] ){
                        arrays[ types[v.type].atomic ] = new types[v.type].constructor( mappedRange );
                  }
                  for( let i = 0; i < v.data.length/types[v.type].components; i++ ){
                        const next = types[v.type].padding;
                        const start = i*stride + offset;
                        const end = start + next*types[v.type].components
                        for( let j = start; j < end; j += next ){
                              arrays[ types[v.type].atomic ][j] = v.data[ (j - start)/next + i*types[v.type].components ];
                        }
                  }

                  offset += types[v.type].components;
            }
      }
      protected getVertexCount( type: GPUPrimitiveTopology ){
            switch( type ){
                  case "point-list": 
                        return 1;
                  case "line-list":
                  case "line-strip":
                        return 2;
                  case "triangle-list":
                  case "triangle-strip":
                        return 3;
            }
      }
      protected createIndexArray( vertices: number ): number[] {
            const indices: number[] = [];
            for( let i = 0; i < vertices; i++ ){
                  indices.push(i);
            }
            return indices;
      }
      abstract  draw( objects: Drawable[] ): void;
      abstract create( opt: ShaderMessage ): Drawable;
}