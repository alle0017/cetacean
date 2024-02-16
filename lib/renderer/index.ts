import Thread from "../worker.js";
import { Messages, types } from './enums.js'
import type { Engine, ShaderDescriptor, UniformDescriptor, ShaderMessage, Uniform, UniformData, UniformDataDescriptor, } from './types.d.ts';

export default class Renderer {
      private static engine: Engine;
      private static _id = 0;

      private _tid: string = 'rendering thread' + Renderer._id++;
      private cvs: HTMLCanvasElement;

      constructor( private root: HTMLElement = document.body ){
            this.cvs = document.createElement('canvas');
            root.appendChild(this.cvs); 
            Thread.spawn( this._tid, './src/lib/renderer/worker.js' );
            Thread.expose( Messages.CANVAS_PASSED, { cvs: this.cvs.transferControlToOffscreen() }, this._tid );
            Thread.wait( Messages.READY, this._tid );
      }
      private getUniformBufferSize( uniforms: UniformData[][] ){
            let size = 0;
            for( let i = 0; i < uniforms.length; i++ ){
                  for( let j = 0; j < uniforms[i].length; j++ ){
                        if( !uniforms[i][j] || typeof uniforms[i][j] == 'string' || uniforms[i][j] instanceof ImageBitmap )
                              continue;
                        for( const v of Object.values( uniforms[i][j] ) ){
                              size += v.data.length*types[(v as UniformDataDescriptor).type].constructor.BYTES_PER_ELEMENT;
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
            for( const v of opt ){
                  if( !flattened[v.group] )
                        flattened[v.group] = [];
                  flattened[v.group][v.binding] = v.data;
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
                  verticesCount = opt.attributes[opt.verticesAttribute].data.length;
            }else{
                  verticesCount = Object.values( opt.attributes )[0].data.length;
            }

            Thread.post( Messages.NEW_ENTITY, {
                  ...opt,
                  vertexEntry,
                  fragmentEntry,
                  verticesCount,
                  uniforms: this.flatUniforms(opt.uniforms),
            }, this._tid );
      }
      update( id: string, uniforms: { binding: number, group: number, data: number[], name: string }[] ){
            console.log( 'update' )
            Thread.post( Messages.UPDATE_UNIFORMS, {
                  uniforms,
                  id,
            }, this._tid );
      }
}

