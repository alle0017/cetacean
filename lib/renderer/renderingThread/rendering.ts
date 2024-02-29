import Thread from "../../worker.js";
import Engine from "../engines/engine.js";
import WebGPUEngine from "../engines/webgpuEngine.js";

import type { Drawable, UniformDataDescriptor } from "./types.d.ts";

/**
 * class delegate to send commands to the rendering engine
 */
export default class RendererWorker {

      static engine: Engine;
      
      entities: Record<string, Drawable> = {};
      saved: Record<string, Drawable> = {};
      frames: number;

      static async getEngine( offscreen: OffscreenCanvas ){
            const e = await WebGPUEngine.new( offscreen );
            if( e )
                  this.engine = e;
            else{
                  Thread.log('cannot use webgpu')
            }
      }
      constructor(){}

      save( id: string ){
            if( !this.entities[id] )
                  return;
            this.saved[id] = this.entities[id];
      }
      loadSavedEntity( id: string | string[] ){
            if( typeof id == 'string' ){
                  this.saved[id] && ( this.entities[id] = this.saved[id] );
                  return;
            }
            for( let i = 0; i < id.length; i++ ){
                  this.saved[id[i]] && ( this.entities[id[i]] = this.saved[id[i]] );
            }
      }
      draw(){
            const render = (()=>{
                  RendererWorker.engine.draw( Object.values( this.entities ) )
                  this.frames = requestAnimationFrame(render);
            }).bind(this)
            render();
      }
      /** removes all entities from the renderer. called to free memory between scenes */
      remove(){
            this.entities = {};
      }
      update( id: string, uniforms: { binding: number, group: number, data: Record<string,number[]> }[] ){
            
            if( !this.entities[id] ){
                  Thread.error( 'No entities found with id ' + id );
                  return;
            }
            for( let i = 0; i < uniforms.length; i++ ){
                  const entries = Object.entries( uniforms[i].data );
                  
                  for( let j = 0; j < entries.length; j++ ){
                        RendererWorker.engine.write(
                              this.entities[id].uBuffer,
                              this.entities[id].uniformMap[uniforms[i].group][uniforms[i].binding][entries[j][0]],
                              entries[j][1],
                              (this.entities[id].uniforms[uniforms[i].group][uniforms[i].binding] as Record<string, UniformDataDescriptor> )[entries[j][0]].type
                        );
                  }
            }
      }
}