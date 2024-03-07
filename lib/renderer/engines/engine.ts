import { types } from "../renderingThread/enums.js";
import type { AttributeDescriptor, TypedArray, Drawable, ShaderMessage, GPUType, } from "../renderingThread/types.js";

export default abstract class Engine {
      /**bind two arrays by mixing them and returns the offset of the next attribute to mix */
      protected mixArrays( mappedRange: ArrayBuffer, attributes: Record<string, AttributeDescriptor>, stride: number ){
      
            const arrays: Record<string,TypedArray> = {};
            let offset = 0;
            const values = Object.values( attributes );

            for( let x = 0; x < values.length; x++ ){
                  
                  if( !arrays[ types[values[x].type].atomic ] ){
                        arrays[ types[values[x].type].atomic ] = new types[values[x].type].constructor( mappedRange );
                  }
                  for( let i = 0; i < values[x].data.length/types[values[x].type].components; i++ ){
                        const next = types[values[x].type].padding;
                        const start = i*stride + offset;
                        const end = start + next*types[values[x].type].components
                        for( let j = start; j < end; j += next ){
                              arrays[ types[values[x].type].atomic ][j] = 
                              values[x].data[ (j - start)/next + i*types[values[x].type].components ];
                        }
                  }
                  offset += types[values[x].type].components;
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
      abstract write( buffer: GPUBuffer, offset: number, data: number[], type: GPUType ): void;
}
