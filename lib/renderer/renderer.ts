import Thread from "../worker.js";
import { Messages, types } from './enums.js'
import type { ShaderDescriptor, UniformDescriptor, Uniform, UniformData, UniformDataDescriptor, } from './types.js';

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
export default class Renderer {
      private static _id = 0;
      private static _uPadding = '__u_pad_ire';

      static minUniformOffset: number = 256;

      private _tid: string = 'rendering thread' + Renderer._id++;

      cvs: HTMLCanvasElement;

      constructor( private root: HTMLElement = document.body ){
            this.cvs = document.createElement('canvas');
            
            root.appendChild( this.cvs ); 

            Thread.spawn( this._tid, new URL( './worker.js', import.meta.url ) );
            Thread.expose( Messages.CANVAS_PASSED, { cvs: this.cvs.transferControlToOffscreen() }, this._tid );
            Thread.wait( Messages.READY, this._tid );
      }
      private addPaddingKey( struct: Record<string,UniformDataDescriptor>, deltaSize: number ) {
            
            const padding: number[] = [];

            let key = 0;

            for( let i = 0; i < deltaSize/4; i++ ){
                  padding.push(0);
            }
            while( `${Renderer._uPadding}.${key}` in struct ){
                  key++;
            }
            struct[`${Renderer._uPadding}.${key}`] = {
                  type: 'f32',
                  data: padding,
            }
      }
      private getUniformBufferSize( uniforms: UniformData[][] ){
            let size = 0;
            /**last buffer position in array */
            let last: [number, number] = [0,0];

            for( let i = 0; i < uniforms.length; i++ ){
                  for( let j = 0; j < uniforms[i].length; j++ ){
                        if( !uniforms[i][j] || typeof uniforms[i][j] == 'string' || uniforms[i][j] instanceof ImageBitmap )
                              continue;
                        if( size && size%Renderer.minUniformOffset ){
                              this.addPaddingKey( 
                                    uniforms
                                    [ last[0] ]
                                    [ last[1] ] as Record<string, UniformDataDescriptor>, 
                                    size%Renderer.minUniformOffset
                              )
                        }
                        last = [i,j];

                        const values = Object.values( uniforms[i][j] );
                        
                        for( let i = 0; i < values.length; i++ ){
                              size += values[i].data.length*types[(values[i] as UniformDataDescriptor).type].constructor.BYTES_PER_ELEMENT;
                        }
                  }
            }
            return size;
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
            const size = this.getUniformBufferSize( flattened );
            return {
                  entries: flattened,
                  size
            }
      }
      render(){
            Thread.post( Messages.START, null, this._tid );
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

            Thread.post( Messages.NEW_ENTITY, {
                  ...opt,
                  vertexEntry,
                  fragmentEntry,
                  verticesCount,
                  uniforms: this.flatUniforms(opt.uniforms),
            }, this._tid );
      }
      /**
       * save entity with specified id for later use after remove ( @see remove )
       */
      save( id: string ){
            Thread.post( Messages.SAVE, {
                  id
            }, this._tid );
      }
      loadSavedEntities( id: string | string[] ){
            Thread.post( Messages.LOAD_SAVED, {
                  id
            }, this._tid );
      }
      update( id: string, uniforms: { binding: number, group: number, data: Record<string,number[]> }[] ){
            
            Thread.post( Messages.UPDATE_UNIFORMS, {
                  uniforms,
                  id,
            }, this._tid );
      }
      /**
       * remove all entities actually rendered 
       * they need to be re-created to be rendered again
       */
      removeAll(){
            Thread.post( Messages.DELETE_ALL, null, this._tid );
      }

      changeRoot( newRoot: HTMLElement ){
            this.root = newRoot;
            this.cvs.remove();
            this.root.append( this.cvs );
      }
}

