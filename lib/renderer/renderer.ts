import { types } from './renderingThread/enums.js'
import type { ShaderDescriptor, UniformDescriptor, Uniform, UniformData, UniformDataDescriptor, GPUType, } from './renderingThread/types.js';
import WorkerMaster from "./master.js";

const getDeviceOffset = async ()=>{
      let adapter = await navigator.gpu.requestAdapter()
      return <T extends { minUniformOffset: number; new(): {} }>( constructor: T )=>{
            constructor.minUniformOffset = adapter? 
            adapter.limits.minUniformBufferOffsetAlignment: 
            256;
            return constructor;
      }     
}

@(await getDeviceOffset())
export default class Renderer extends WorkerMaster {
      private static _uPadding = '__delta_padding_for_GPU_structs';

      static minUniformOffset: number = 256;

      private addPaddingKey( struct: Record<string,UniformDataDescriptor>, deltaSize: number ) {
            
            const padding: number[] = [];

            let key = 0;

            for( let i = 0; i < deltaSize/4; i++ ){
                  padding.push(0);
            }
            while( `${Renderer._uPadding}_${key}` in struct ){
                  key++;
            }
            
            struct[`${Renderer._uPadding}_${key}`] = {
                  type: 'f32',
                  data: padding,
            }
      }
      private addPaddingToUniform( u: UniformDataDescriptor, alignment: number){
            const data: number[] = [];
            const delta = (alignment - types[u.type].components * types[u.type].constructor.BYTES_PER_ELEMENT)/types[u.type].constructor.BYTES_PER_ELEMENT;   

            if( !delta )
                  return;
            const padding: number[] = [];
            for( let j = 0; j < delta; j++ ){
                  padding.push(0)
            }
            for( let i = 0; i < u.data.length; i += types[u.type].components ){
                  data.push( 
                        ...u.data.slice( i, types[u.type].components ), 
                        ...padding,
                  );
            }
            u.data = data;
      }
      private getSizeOfStruct( values: UniformDataDescriptor[] ){

            let size = 0;
            let type: GPUType = 'i8';

            for( let i = 0; i < values.length; i++ ){
                  let components = types[values[i].type].components;
                  let typeSize = types[values[i].type].constructor.BYTES_PER_ELEMENT;

                  if( types[type].components * types[type].constructor.BYTES_PER_ELEMENT < components * typeSize )
                        type = values[i].type;
            }
            let alignment = types[type].components * types[type].constructor.BYTES_PER_ELEMENT;
            //align to 4
            if( types[type].components == 3 )
                  alignment += types[type].constructor.BYTES_PER_ELEMENT;

            for( let i = 0; i < values.length; i++ ){
                  this.addPaddingToUniform( values[i] as UniformDataDescriptor, alignment )
                  size += values[i].data.length*types[values[i].type].constructor.BYTES_PER_ELEMENT;
            }
            return size;
      }
      private getUniformBufferSize( uniforms: UniformData[][] ){
            const sizesForStruct: number[][] = []

            let size = 0;
            /**last buffer position in array */
            let last: [number, number] = [0,0];

            for( let i = 0; i < uniforms.length; i++ ){
                  for( let j = 0; j < uniforms[i].length; j++ ){
                        if( !uniforms[i][j] || typeof uniforms[i][j] == 'string' || uniforms[i][j] instanceof ImageBitmap )
                              continue;
                        
                        //correcting size if it is not aligned properly (only if it isn't hte last element)
                        if( size && size%Renderer.minUniformOffset ){
                              this.addPaddingKey( 
                                    uniforms
                                    [ last[0] ]
                                    [ last[1] ] as Record<string, UniformDataDescriptor>, 
                                    Renderer.minUniformOffset - size%Renderer.minUniformOffset
                              )
                        }
                        last = [i,j];

                        const values = Object.values( uniforms[i][j] );
                        

                        if( !sizesForStruct[i] )
                              sizesForStruct[i] = [];
                        sizesForStruct[i][j] = this.getSizeOfStruct( values as UniformDataDescriptor[] );

                        size += sizesForStruct[i][j];
                  }
            }
            return { 
                  size, 
                  sizesForStruct 
            };
      }
      private getEntry( fragment: string, vertex: string ){
            const fragmentEntry = fragment.match(/@fragment[\s\b]+fn[\s\b]+[a-zA-Z0-9_]+[\s\b]*/);
            const vertexEntry = vertex.match(/@vertex[\s\b]+fn[\s\b]+[a-zA-Z0-9_]+[\s\b]*/);
            if( !fragmentEntry ){
                  console.error( 'no fragment entry point found in fragment shader');
                  return {
                        fragmentEntry: '',
                        vertexEntry: ''
                  }
            }
            if( !vertexEntry ){
                  console.error( 'no vertex entry point found in vertex shader');
                  return {
                        fragmentEntry: '',
                        vertexEntry: ''
                  }
            }
            return {
                  fragmentEntry: fragmentEntry[0].replace(/@fragment[\s\b]+fn[\s\b]+/, ''),
                  vertexEntry: vertexEntry[0].replace(/@vertex[\s\b]+fn[\s\b]+/, ''),
            }
      }
      private flatUniforms( opt: UniformDescriptor[] ): Uniform {
            const flattened: UniformData[][] = [];
            for( let i = 0; i < opt.length; i++ ){
                  if( !flattened[opt[i].group] )
                        flattened[opt[i].group] = [];
                  flattened[opt[i].group][opt[i].binding] = opt[i].data;
            }
            const { size, sizesForStruct} = this.getUniformBufferSize( flattened );
            return {
                  entries: flattened,
                  size,
                  sizesForStruct,
            }
      }

      create( opt: ShaderDescriptor ){
            const { vertexEntry, fragmentEntry } = this.getEntry( opt.fragment, opt.vertex );
            let verticesCount = 0;

            if( !vertexEntry || !fragmentEntry ){
                  console.error( `no entry point found, the object ${opt.id} is automatically discarded` );
                  return;
            }

            if( opt.attributes[opt.verticesAttribute] ){
                  verticesCount = opt.attributes[opt.verticesAttribute].data.length/types[opt.attributes[opt.verticesAttribute].type].components;
            }else{
                  verticesCount = Object.values( opt.attributes )[0].data.length/types[opt.attributes[opt.verticesAttribute].type].components;
            }

            this.sendNewEntityToThread({
                  ...opt,
                  vertexEntry,
                  fragmentEntry,
                  verticesCount,
                  uniforms: this.flatUniforms(opt.uniforms),
            });
      }

      changeRoot( newRoot: HTMLElement ){
            this.root = newRoot;
            this.cvs.remove();
            this.root.append( this.cvs );
      }
}

